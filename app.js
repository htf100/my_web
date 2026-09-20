(() => {
  'use strict';
  const M = window.CommandModel;
  const $ = s => document.querySelector(s);
  const KEY = 'htf-command-desk-v2';
  const VIEW_KEY = 'htf-command-desk-layout-v2';
  const clone = value => JSON.parse(JSON.stringify(value));
  const uid = () => 'id-' + crypto.randomUUID();
  let library = M.validate(window.COMMAND_LIBRARY);
  const projectPack = M.validate({
    categories: library.categories.filter(c => c.id.startsWith('htf-')),
    commands: library.commands.filter(c => c.id.startsWith('htf-')),
  });
  let record = null, snapshot = null, unlocked = false, writable = true;
  let history = [], active = 0, toastTimer, onSubmit, draggingId = null;
  let view = { count: 3, panels: ['server-root', 'colab-root', 'troubleshoot-root', 'all'], collapsed: [] };
  function el(tag, cls, text) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function button(text, action, cls = '') {
    const node = el('button', cls, text); node.type = 'button'; node.addEventListener('click', action); return node;
  }
  function notice(text) { $('#notice').hidden = !text; $('#notice').textContent = text; }
  function notify(text) {
    clearTimeout(toastTimer); $('#toast').textContent = text; $('#toast').classList.add('visible');
    toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 3000);
  }
  try {
    snapshot = localStorage.getItem(KEY);
    if (snapshot) {
      record = JSON.parse(snapshot);
      if (!record || record.version !== 2 || !record.lock || typeof record.lock.hash !== 'string' || typeof record.lock.salt !== 'string') throw new Error('保存格式不正确');
      library = M.validate(record.library);
    }
    const probe = KEY + '-probe'; localStorage.setItem(probe, '1'); localStorage.removeItem(probe);
  } catch {
    writable = false;
    notice('无法读取或写入本地存储。当前只读，原有存储未覆盖；请检查浏览器存储权限，或从 JSON 备份恢复。');
  }
  try {
    const saved = JSON.parse(localStorage.getItem(VIEW_KEY));
    if (saved && [1, 2, 3, 4].includes(saved.count) && Array.isArray(saved.panels)) {
      view.count = saved.count;
      view.panels = Array.from({ length: 4 }, (_, i) => typeof saved.panels[i] === 'string' ? saved.panels[i] : 'all');
      view.collapsed = Array.isArray(saved.collapsed) ? saved.collapsed.filter(id => typeof id === 'string') : [];
    }
  } catch { /* Read-only use remains available. */ }
  function saveView() { try { localStorage.setItem(VIEW_KEY, JSON.stringify(view)); } catch { notify('布局未能保存，当前页面仍可使用。'); } }
  function checkEdit() {
    if (!writable) throw new Error('本地存储不可用，暂时无法保存修改。');
    if (!unlocked) throw new Error('请先输入密令，解锁编辑。');
  }
  function write(nextLibrary, lock = record?.lock) {
    if (!writable) throw new Error('本地存储不可用。');
    if (localStorage.getItem(KEY) !== snapshot) {
      unlocked = false; render();
      throw new Error('另一个标签页已更新命令库。请先导出当前内容，再刷新页面后重试，避免覆盖更新。');
    }
    const nextRecord = { version: 2, library: M.validate(nextLibrary), lock, updatedAt: new Date().toISOString() };
    const serialized = JSON.stringify(nextRecord);
    try { localStorage.setItem(KEY, serialized); }
    catch { throw new Error('保存失败，浏览器空间可能不足。本次修改未生效，请先导出备份。'); }
    snapshot = serialized; record = nextRecord; library = nextRecord.library;
  }
  function commit(change, message, remember = true) {
    checkEdit();
    const previous = clone(library), draft = clone(library);
    change(draft); write(draft);
    if (remember) { history.push(previous); if (history.length > 20) history.shift(); }
    render(); notify(message);
  }
  function run(action) { try { action(); } catch (error) { notify(error.message); } }
  function requireEdit(action) {
    if (!writable) return notify('本地存储不可用，暂时无法编辑。');
    if (!unlocked) { openUnlock(); return; }
    action();
  }
  function options(selected = 'all', includeAll = false, exclude = new Set(), includeRoot = false) {
    const select = el('select');
    if (includeAll) select.append(new Option('全部分类', 'all'));
    if (includeRoot) select.append(new Option('无上级 · 一级标题', ''));
    M.ordered(library).filter(c => !exclude.has(c.id)).forEach(c => select.append(new Option('　'.repeat(c.depth) + c.label, c.id)));
    select.value = selected;
    if (select.selectedIndex < 0 && select.options.length) select.selectedIndex = 0;
    return select;
  }
  function setActive(index) {
    active = index;
    document.querySelectorAll('.column').forEach((column, i) => column.classList.toggle('active', i === index));
    document.querySelectorAll('.column-active').forEach((b, i) => { b.textContent = `第 ${i + 1} 栏${i === index ? ' · 当前' : ''}`; b.setAttribute('aria-pressed', String(i === index)); });
    renderNav();
  }
  function countCategory(id) { const ids = M.descendants(library, id); return library.commands.filter(c => ids.has(c.category)).length; }
  function renderNav() {
    const nav = $('#categories'); nav.replaceChildren();
    const choose = id => {
      view.panels[active] = id; saveView(); render();
      if (matchMedia('(max-width: 760px)').matches) { $('.sidebar').classList.remove('menu-open'); $('#mobile-menu').setAttribute('aria-expanded', 'false'); }
    };
    const all = button('全部命令', () => choose('all'), 'nav-item');
    all.append(el('small', '', library.commands.length));
    if (view.panels[active] === 'all') all.setAttribute('aria-current', 'page');
    nav.append(all);
    function add(parent, container) {
      for (const c of library.categories.filter(c => c.parent === parent)) {
        const item = el('div', 'tree-node'), row = el('div', 'tree-row');
        const children = library.categories.some(n => n.parent === c.id), collapsed = view.collapsed.includes(c.id);
        if (children) {
          const toggle = button(collapsed ? '›' : '⌄', () => {
            view.collapsed = collapsed ? view.collapsed.filter(id => id !== c.id) : [...view.collapsed, c.id]; saveView(); renderNav();
          }, 'tree-toggle');
          toggle.setAttribute('aria-label', `${collapsed ? '展开' : '收起'}${c.label}`); toggle.setAttribute('aria-expanded', String(!collapsed)); row.append(toggle);
        } else row.append(el('span', 'tree-dot', '·'));
        const select = button(c.label, () => choose(c.id), 'nav-item');
        select.title = M.path(library, c.id); select.append(el('small', '', countCategory(c.id)));
        if (view.panels[active] === c.id) select.setAttribute('aria-current', 'page');
        row.append(select); item.append(row);
        if (children && !collapsed) { const nested = el('div', 'tree-children'); add(c.id, nested); item.append(nested); }
        container.append(item);
      }
    }
    add(null, nav); $('#category-count').textContent = library.categories.length;
  }
  const copyTimers = new WeakMap();
  function setCopyState(copyButton, copied) {
    if (copied) {
      const check = el('span', 'copy-check', '✓'); check.setAttribute('aria-hidden', 'true');
      copyButton.replaceChildren(check);
      copyButton.classList.add('copied'); copyButton.title = '已复制';
      return;
    }
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', '18'); svg.setAttribute('height', '18');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    const path = document.createElementNS(svg.namespaceURI, 'path');
    path.setAttribute('d', 'M9 9h11v11H9z M15 5V3H3v12h2');
    svg.append(path); copyButton.replaceChildren(svg);
    copyButton.classList.remove('copied');
    copyButton.title = '复制命令';
  }
  async function copyCommand(command, code, copyButton) {
    clearTimeout(copyTimers.get(copyButton));
    setCopyState(copyButton, false);
    let copied = false;
    try { if (navigator.clipboard && isSecureContext) { await navigator.clipboard.writeText(command.code); copied = true; } } catch { /* fall back */ }
    if (!copied) {
      const input = el('textarea'); input.value = command.code; input.style.cssText = 'position:fixed;left:-9999px'; document.body.append(input); input.select();
      try { copied = document.execCommand('copy'); } catch { /* select code below */ }
      input.remove(); copyButton.focus({ preventScroll: true });
    }
    if (!copied) {
      const range = document.createRange(); range.selectNodeContents(code); const selection = getSelection(); selection.removeAllRanges(); selection.addRange(range);
      return notify('内容已选中，请按 Ctrl+C 或 ⌘C 复制。');
    }
    setCopyState(copyButton, true); notify(`已复制：${command.title}`);
    copyTimers.set(copyButton, setTimeout(() => { setCopyState(copyButton, false); copyTimers.delete(copyButton); }, 2000));
  }
  function card(command) {
    const article = el('article', 'card'); article.dataset.command = command.id; article.dataset.dropCategory = command.category; article.dataset.before = command.id;
    const meta = el('div', 'card-meta'); meta.append(el('span', 'tag', command.context || command.environment), el('span', 'language', command.language));
    if (unlocked) {
      const drag = button('⠿', () => openMove(command), 'drag-handle'); drag.title = '拖动整理；点击选择移动位置'; drag.setAttribute('aria-label', `移动 ${command.title}`); drag.draggable = true;
      drag.addEventListener('dragstart', event => {
        draggingId = command.id; event.dataTransfer.setData('application/x-htf-command', command.id); event.dataTransfer.effectAllowed = 'move'; article.classList.add('dragging');
      });
      drag.addEventListener('dragend', () => { draggingId = null; article.classList.remove('dragging'); document.querySelectorAll('.drop-target').forEach(n => n.classList.remove('drop-target')); });
      meta.prepend(drag);
    }
    article.append(meta, el('h4', '', command.title));
    if (command.description) article.append(el('p', 'description', command.description));
    if (command.code) {
      const area = el('div', 'code-area'), toolbar = el('div', 'code-toolbar');
      const pre = el('pre'), code = el('code', '', command.code); pre.tabIndex = 0; pre.append(code);
      const copy = button('', () => copyCommand(command, code, copy), 'copy'); copy.setAttribute('aria-label', `复制：${command.title}`); setCopyState(copy, false);
      toolbar.append(copy); area.append(toolbar, pre); article.append(area);
    }
    if (command.note) article.append(el('p', command.warning ? 'note warning' : 'note', command.note));
    if (unlocked) {
      const actions = el('div', 'card-actions');
      actions.append(button('编辑', () => openCommand(command)), button('移动', () => openMove(command)), button('删除', () => confirmDeleteCommand(command), 'danger-link'));
      article.append(actions);
    }
    return article;
  }
  function matches(command) {
    const environment = $('#environment').value;
    const tokens = $('#search').value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    const content = [command.title, command.code, command.description, command.note, command.context, command.language, M.path(library, command.category)].join(' ').toLocaleLowerCase();
    return (environment === 'all' || command.environment === environment) && tokens.every(t => content.includes(t));
  }
  function renderBoard(preserveScroll = true) {
    const board = $('#board');
    const scrolls = new Map(Array.from(board.children, column => [column.dataset.column + ':' + column.dataset.category, column.querySelector('.column-body').scrollTop]));
    board.replaceChildren(); board.style.setProperty('--columns', view.count);
    const matching = library.commands.filter(matches), shown = new Set();
    for (let i = 0; i < view.count; i++) {
      let chosen = view.panels[i];
      if (chosen !== 'all' && !library.categories.some(c => c.id === chosen)) chosen = view.panels[i] = 'all';
      const column = el('section', 'column' + (active === i ? ' active' : '')); column.dataset.column = i; column.dataset.category = chosen;
      column.addEventListener('pointerdown', () => { if (active !== i) setActive(i); });
      const header = el('div', 'column-header');
      const top = el('div', 'column-top');
      const activate = button(`第 ${i + 1} 栏${active === i ? ' · 当前' : ''}`, () => setActive(i), 'column-active'); activate.setAttribute('aria-pressed', String(active === i)); top.append(activate);
      if (i > 0) { const left = button('←', () => { [view.panels[i - 1], view.panels[i]] = [view.panels[i], view.panels[i - 1]]; active = i - 1; saveView(); render(); }, 'swap'); left.setAttribute('aria-label', `第 ${i + 1} 栏左移`); top.append(left); }
      const select = options(chosen, true); select.setAttribute('aria-label', `第 ${i + 1} 栏分类`);
      select.addEventListener('change', () => { view.panels[i] = select.value; active = i; saveView(); render(); });
      header.append(top, select); column.append(header);
      const body = el('div', 'column-body');
      if (chosen !== 'all') body.dataset.dropCategory = chosen;
      let visible = 0;
      function group(c, depth) {
        const ids = M.descendants(library, c.id), subtree = matching.filter(command => ids.has(command.category));
        const filtering = $('#search').value.trim() || $('#environment').value !== 'all';
        if (!subtree.length && (filtering || !unlocked)) return null;
        const section = el('section', depth ? 'command-group nested' : 'command-group'); section.dataset.dropCategory = c.id;
        const heading = el('div', 'group-heading');
        const title = el(`h${Math.min(depth + 2, 6)}`, '', c.label); heading.append(title, el('small', '', subtree.length));
        if (unlocked) { const add = button('+', () => openCommand(null, c.id), 'group-add'); add.setAttribute('aria-label', `在${c.label}添加命令`); heading.append(add); }
        section.append(heading);
        for (const command of matching.filter(command => command.category === c.id)) { section.append(card(command)); visible++; shown.add(command.id); }
        for (const child of library.categories.filter(child => child.parent === c.id)) { const sub = group(child, depth + 1); if (sub) section.append(sub); }
        if (!subtree.length) section.append(el('p', 'drop-placeholder', '还没有命令，点击 + 添加，或拖动命令到这里。'));
        return section;
      }
      const roots = chosen === 'all' ? library.categories.filter(c => c.parent === null) : library.categories.filter(c => c.id === chosen);
      roots.forEach(c => { const section = group(c, 0); if (section) body.append(section); });
      if (!visible && !body.children.length) {
        const empty = el('div', 'empty'); empty.append(el('h3', '', '这里还没有匹配的命令'), el('p', '', '更换分类，或调整搜索与环境筛选。'));
        if (unlocked && chosen !== 'all') empty.append(button('添加命令', () => openCommand(null, chosen)));
        body.append(empty);
      }
      column.append(body); board.append(column);
      if (preserveScroll) body.scrollTop = scrolls.get(i + ':' + chosen) || 0;
    }
    $('#result-count').textContent = `当前 ${shown.size} / ${library.commands.length} 条`;
  }
  function render() {
    active = Math.min(active, view.count - 1);
    $('#unlock').hidden = unlocked; $('#unlock').textContent = record?.lock ? '密令解锁' : '设置密令';
    $('#lock').hidden = !unlocked; $('#change-passphrase').hidden = !unlocked;
    $('#lock-status').textContent = unlocked ? '编辑已解锁' : '只读模式'; $('#lock-status').classList.toggle('unlocked', unlocked);
    $('#undo').hidden = !unlocked || !history.length;
    const missing = projectPack.commands.filter(c => !library.commands.some(existing => existing.id === c.id)).length;
    $('#add-project-commands').hidden = !missing;
    $('#add-project-commands').textContent = `补充项目命令 · ${missing}`;
    $('#save-status').textContent = record?.updatedAt ? `已保存到此浏览器 · ${new Date(record.updatedAt).toLocaleString('zh-CN')}` : '初始命令库 · 设置密令后可本地编辑';
    document.querySelectorAll('[data-count]').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.count) === view.count)));
    renderNav(); renderBoard();
  }
  function showDialog(title, submitText, submit) {
    const dialog = $('#modal');
    if (dialog.open) dialog.close();
    $('#dialog-title').textContent = title; $('#dialog-body').replaceChildren(); $('#dialog-error').hidden = true;
    $('#dialog-submit').textContent = submitText; $('#dialog-submit').hidden = !submit; $('#dialog-submit').disabled = false;
    onSubmit = submit; dialog.showModal();
    return $('#dialog-body');
  }
  function field(container, name, label, value = '', type = 'text', required = false) {
    const wrapper = el('label', 'field'); wrapper.append(el('span', '', label));
    const input = el(type === 'textarea' ? 'textarea' : 'input'); input.name = name;
    if (type !== 'textarea') input.type = type;
    input.value = value; input.required = required;
    if (type === 'password') { input.minLength = 6; input.maxLength = 200; input.autocomplete = 'new-password'; }
    wrapper.append(input); container.append(wrapper); return input;
  }
  function selectField(container, name, label, select) {
    const wrapper = el('label', 'field'); wrapper.append(el('span', '', label)); select.name = name; wrapper.append(select); container.append(wrapper); return select;
  }
  function simpleOptions(entries, value) { const select = el('select'); entries.forEach(([v, label]) => select.append(new Option(label, v))); select.value = value; return select; }
  async function hashSecret(secret, salt) {
    if (!crypto.subtle) throw new Error('此浏览器无法使用密令校验。请用 localhost 或 HTTPS 打开网站。');
    const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: Uint8Array.from(salt.match(/../g), x => parseInt(x, 16)), iterations: 150000, hash: 'SHA-256' }, material, 256);
    return Array.from(new Uint8Array(bits), b => b.toString(16).padStart(2, '0')).join('');
  }
  async function newLock(secret) {
    const salt = Array.from(crypto.getRandomValues(new Uint8Array(16)), b => b.toString(16).padStart(2, '0')).join('');
    return { salt, hash: await hashSecret(secret, salt), algorithm: 'PBKDF2-SHA256', iterations: 150000 };
  }
  function openUnlock(change = false) {
    if (!writable) return notify('本地存储不可用，请检查浏览器权限。');
    const setup = !record?.lock || change;
    const body = showDialog(change ? '修改密令' : setup ? '设置编辑密令' : '解锁编辑', setup ? '保存密令并解锁' : '解锁', async data => {
      const baseline = snapshot;
      if (setup) {
        if (data.get('secret') !== data.get('confirm')) throw new Error('两次输入的密令不一致。');
        if (change) checkEdit();
        const lock = await newLock(data.get('secret'));
        if (baseline !== snapshot) throw new Error('命令库已更新，请重新设置密令。');
        write(library, lock);
      } else {
        const hash = await hashSecret(data.get('secret'), record.lock.salt);
        if (baseline !== snapshot) throw new Error('命令库已更新，请重新输入密令。');
        if (hash !== record.lock.hash) throw new Error('密令不正确，请重试。');
      }
      if (localStorage.getItem(KEY) !== snapshot) throw new Error('另一个标签页已修改数据，请刷新页面后再解锁。');
      unlocked = true; render(); notify('已解锁，可以添加、编辑和整理命令。');
    });
    body.append(el('p', 'dialog-help', '密令只锁定此浏览器的编辑操作，不加密内容，也不跨设备同步。刷新页面后自动锁定。'));
    const secret = field(body, 'secret', setup ? '新密令（至少 6 位）' : '编辑密令', '', 'password', true);
    if (!setup) secret.autocomplete = 'current-password';
    if (setup) field(body, 'confirm', '再次输入密令', '', 'password', true);
    secret.focus();
  }
  function openCommand(command = null, category = null) {
    requireEdit(() => {
      if (!library.categories.length) return openCategory();
      const selected = category || command?.category || (view.panels[active] === 'all' ? library.categories[0]?.id : view.panels[active]);
      const body = showDialog(command ? '编辑命令' : '添加命令', '保存命令', data => {
        const entry = { id: command?.id || uid(), title: data.get('title').trim(), category: data.get('category'), description: data.get('description'), code: data.get('code'), note: data.get('note'), environment: data.get('environment'), context: data.get('context'), language: data.get('language'), warning: data.get('warning') === 'on' };
        commit(draft => {
          if (command) { const index = draft.commands.findIndex(c => c.id === command.id); if (index < 0) throw new Error('此命令已经被删除。'); draft.commands[index] = entry; }
          else draft.commands.push(entry);
        }, command ? '命令已更新' : '命令已添加');
      });
      const name = field(body, 'title', '命令名称', command?.title || '', 'text', true); name.maxLength = 160;
      selectField(body, 'category', '所属分类 / 多级标题', options(selected));
      field(body, 'description', '用途说明', command?.description || '');
      const code = field(body, 'code', '命令内容（支持多行；留空可作为说明卡片）', command?.code || '', 'textarea'); code.rows = 7; code.spellcheck = false;
      const row = el('div', 'form-row'); body.append(row);
      selectField(row, 'environment', '运行环境', simpleOptions([['server', '服务器 / Windows'], ['colab', 'Google Colab'], ['other', '其他']], command?.environment || (M.path(library, selected).includes('Colab') ? 'colab' : 'server')));
      field(row, 'language', '语言 / 类型', command?.language || 'Shell');
      field(body, 'context', '运行位置', command?.context || '', 'text');
      field(body, 'note', '备注', command?.note || '', 'textarea');
      const check = el('label', 'check-field'); const input = el('input'); input.type = 'checkbox'; input.name = 'warning'; input.checked = command?.warning || false; check.append(input, el('span', '', '突出显示备注提醒')); body.append(check); name.focus();
    });
  }
  function openMove(command) {
    requireEdit(() => {
      const body = showDialog('移动命令', '确认移动', data => commit(draft => M.move(draft, command.id, data.get('category'), data.get('before') || null), '命令已移动'));
      body.append(el('p', 'dialog-help', command.title));
      const category = selectField(body, 'category', '目标分类', options(command.category));
      const before = selectField(body, 'before', '放置位置', el('select'));
      const refresh = () => { before.replaceChildren(new Option('分类末尾', '')); library.commands.filter(c => c.category === category.value && c.id !== command.id).forEach(c => before.append(new Option('放在「' + c.title + '」之前', c.id))); };
      category.addEventListener('change', refresh); refresh();
    });
  }
  function confirmDeleteCommand(command) {
    requireEdit(() => {
      const body = showDialog('删除命令', '确认删除', () => commit(draft => { draft.commands = draft.commands.filter(c => c.id !== command.id); }, '已删除，可撤销'));
      body.append(el('p', 'dialog-help', `删除「${command.title}」？删除后可用“撤销上次修改”恢复。`));
    });
  }
  function openCategory(category = null, parent = null) {
    requireEdit(() => {
      const body = showDialog(category ? '编辑分类标题' : '添加分类标题', '保存分类', data => {
        const entry = { id: category?.id || uid(), label: data.get('label').trim(), parent: data.get('parent') || null };
        commit(draft => {
          if (category) { const index = draft.categories.findIndex(c => c.id === category.id); if (index < 0) throw new Error('分类已不存在。'); draft.categories[index] = entry; }
          else draft.categories.push(entry);
        }, '分类已保存');
      });
      field(body, 'label', '标题名称', category?.label || '', 'text', true).maxLength = 80;
      selectField(body, 'parent', '上级标题（最多 6 级）', options(category?.parent || parent || '', false, category ? M.descendants(library, category.id) : new Set(), true));
      body.append(el('p', 'dialog-help', '选择上级标题即可建立子分类；命令可以放在任意一级标题下面。'));
    });
  }
  function manageCategories() {
    requireEdit(() => {
      const body = showDialog('管理多级分类', '', null);
      body.append(button('＋ 添加一级标题', () => openCategory(), 'primary'));
      const list = el('div', 'category-manager');
      for (const c of M.ordered(library)) {
        const row = el('div', 'manager-row'), info = el('div'); info.append(el('strong', '', c.label), el('small', '', M.path(library, c.id))); row.append(info);
        const actions = el('div', 'manager-actions');
        actions.append(button('子分类', () => openCategory(null, c.id)), button('编辑', () => openCategory(c)), button('↑', () => run(() => {
          const siblings = library.categories.filter(n => n.parent === c.parent), index = siblings.findIndex(n => n.id === c.id);
          if (index <= 0) return notify('已经是同级第一个分类。');
          commit(draft => { const a = draft.categories.findIndex(n => n.id === c.id), b = draft.categories.findIndex(n => n.id === siblings[index - 1].id); [draft.categories[a], draft.categories[b]] = [draft.categories[b], draft.categories[a]]; }, '分类顺序已更新'); manageCategories();
        })), button('删除', () => {
          const ids = M.descendants(library, c.id), count = library.commands.filter(cmd => ids.has(cmd.category)).length;
          const confirmBody = showDialog('删除分类及其内容', '确认删除', () => commit(draft => { draft.categories = draft.categories.filter(n => !ids.has(n.id)); draft.commands = draft.commands.filter(n => !ids.has(n.category)); }, '分类及内容已删除，可撤销'));
          confirmBody.append(el('p', 'dialog-help', `将删除「${c.label}」及其下的 ${ids.size - 1} 个子分类、${count} 条命令。需要保留的命令请先移动；也可在删除后撤销。`));
        }, 'danger-link'));
        row.append(actions); list.append(row);
      }
      body.append(list);
    });
  }
  function exportLibrary() {
    const output = { format: 'htf-command-desk', version: 2, exportedAt: new Date().toISOString(), library };
    const url = URL.createObjectURL(new Blob([JSON.stringify(output, null, 2)], { type: 'application/json' }));
    const link = el('a'); link.href = url; link.download = `htf-commands-${new Date().toISOString().slice(0, 10)}.json`; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify('备份已导出，不包含密令。');
  }
  $('#dialog-form').addEventListener('submit', async event => {
    event.preventDefault(); if (!onSubmit) return;
    const submit = onSubmit; $('#dialog-submit').disabled = true; $('#dialog-error').hidden = true;
    try { await submit(new FormData(event.currentTarget)); $('#modal').close(); }
    catch (error) { $('#dialog-error').textContent = error.message; $('#dialog-error').hidden = false; }
    finally { $('#dialog-submit').disabled = false; }
  });
  $('#dialog-close').addEventListener('click', () => $('#modal').close());
  $('#dialog-cancel').addEventListener('click', () => $('#modal').close());
  $('#modal').addEventListener('close', () => { $('#dialog-body').querySelectorAll('input[type=password]').forEach(input => input.value = ''); });
  $('#unlock').addEventListener('click', () => openUnlock());
  $('#change-passphrase').addEventListener('click', () => openUnlock(true));
  $('#lock').addEventListener('click', () => { unlocked = false; history = []; render(); notify('编辑已锁定，仍可浏览和复制。'); });
  $('#add-command').addEventListener('click', () => openCommand());
  $('#add-project-commands').addEventListener('click', () => requireEdit(() => {
    const count = projectPack.commands.filter(c => !library.commands.some(existing => existing.id === c.id)).length;
    const body = showDialog('补充 HTF 项目命令', `添加 ${count} 条`, () => {
      commit(draft => Object.assign(draft, M.mergeMissing(draft, projectPack)), `已补充 ${count} 条项目命令，可撤销`);
      view.panels[active] = 'htf-projects'; saveView(); renderBoard();
    });
    body.append(el('p', 'dialog-help', `将添加缺少的 ${count} 条命令，涵盖 Python 环境、图像测量、数据清洗与训练、资源备份及网站维护。保留你已有的命令、编辑和分类，不恢复此前删除的旧版预置命令。`));
    body.append(el('p', 'dialog-help', '命令中的 /path/to/ 是待替换路径。这里只加入命令库，不会安装依赖、运行算法或启动训练。'));
  }));
  $('#manage-categories').addEventListener('click', manageCategories);
  $('#undo').addEventListener('click', () => run(() => { checkEdit(); const previous = history.at(-1); if (!previous) return; write(previous); history.pop(); render(); notify('已撤销上次修改。'); }));
  $('#column-count').addEventListener('click', event => { const b = event.target.closest('[data-count]'); if (b) { view.count = Number(b.dataset.count); active = Math.min(active, view.count - 1); saveView(); render(); } });
  $('#search').addEventListener('input', () => renderBoard(false));
  $('#environment').addEventListener('change', () => renderBoard(false));
  $('#mobile-menu').addEventListener('click', () => {
    const expanded = $('.sidebar').classList.toggle('menu-open'); $('#mobile-menu').setAttribute('aria-expanded', String(expanded));
  });
  $('#export').addEventListener('click', exportLibrary);
  $('#import').addEventListener('click', () => requireEdit(() => $('#import-file').click()));
  $('#import-file').addEventListener('change', async event => {
    const file = event.target.files[0]; event.target.value = ''; if (!file) return;
    try {
      checkEdit(); if (file.size > 8 * 1024 * 1024) throw new Error('备份过大，请选择小于 8 MB 的 JSON 文件。');
      const data = JSON.parse(await file.text());
      if (data.format && (data.format !== 'htf-command-desk' || data.version !== 2)) throw new Error('不支持此备份格式或版本。');
      const imported = M.validate(data.library || data);
      const body = showDialog('导入备份', '替换并导入', () => commit(draft => { draft.categories = imported.categories; draft.commands = imported.commands; }, '备份已导入，密令保持不变'));
      body.append(el('p', 'dialog-help', `备份包含 ${imported.categories.length} 个分类、${imported.commands.length} 条命令。将替换当前 ${library.commands.length} 条命令；可撤销本次导入。`), button('先导出当前备份', exportLibrary));
    } catch (error) { notify(`导入失败：${error.message}`); }
  });
  $('#board').addEventListener('dragover', event => {
    if (!unlocked || !draggingId) return;
    const target = event.target.closest('[data-drop-category]');
    if (!target) return;
    event.preventDefault(); event.dataTransfer.dropEffect = 'move';
    document.querySelectorAll('.drop-target').forEach(n => n.classList.remove('drop-target')); target.classList.add('drop-target');
  });
  $('#board').addEventListener('drop', event => {
    const target = event.target.closest('[data-drop-category]');
    if (!unlocked || !target || !draggingId) return;
    event.preventDefault(); const id = draggingId; draggingId = null;
    run(() => commit(draft => M.move(draft, id, target.dataset.dropCategory, target.dataset.before || null), '命令已移动'));
  });
  window.addEventListener('storage', event => {
    if (event.key === KEY || event.key === null) {
      unlocked = false; history = []; render();
      notice('命令库已在另一个标签页更改，当前已锁定。请导出需保留的内容，然后刷新本页以加载最新数据。');
    }
  });
  document.addEventListener('keydown', event => {
    if ($('#modal').open) return;
    if (event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey && !event.target.matches('input,textarea,select,[contenteditable]')) { event.preventDefault(); $('#search').focus(); }
    if (event.key === 'Escape' && document.activeElement === $('#search')) { $('#search').value = ''; renderBoard(); }
  });
  render();
})();
