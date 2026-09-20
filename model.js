(function (root) {
  'use strict';
  const MAX_DEPTH = 6;
  function validate(input) {
    if (!input || !Array.isArray(input.categories) || !Array.isArray(input.commands)) throw new Error('备份必须包含 categories 和 commands 数组。');
    if (input.categories.length > 500 || input.commands.length > 5000) throw new Error('最多支持 500 个分类和 5000 条命令。');
    const text = (value, field, max, required = false) => {
      if (typeof value !== 'string' || value.length > max || (required && !value.trim())) throw new Error(`${field}格式不正确或内容过长。`);
      return value;
    };
    const categories = input.categories.map(c => {
      if (!c || typeof c !== 'object') throw new Error('分类格式不正确。');
      return { id: text(c.id, '分类 ID', 120, true), label: text(c.label, '分类名称', 80, true), parent: c.parent == null ? null : text(c.parent, '上级分类', 120, true) };
    });
    const ids = new Set(categories.map(c => c.id));
    if (ids.size !== categories.length || ids.has('all')) throw new Error('分类 ID 重复或使用了保留名称 all。');
    const map = new Map(categories.map(c => [c.id, c]));
    for (const c of categories) {
      let node = c, depth = 0;
      const seen = new Set();
      while (node) {
        if (seen.has(node.id)) throw new Error('分类不能移动到自身或自己的子分类下。');
        seen.add(node.id);
        if (++depth > MAX_DEPTH) throw new Error(`分类最多支持 ${MAX_DEPTH} 级。`);
        if (node.parent !== null && !map.has(node.parent)) throw new Error('找不到分类的上级目录。');
        node = map.get(node.parent);
      }
    }
    const commands = input.commands.map(c => {
      if (!c || typeof c !== 'object') throw new Error('命令格式不正确。');
      if (!ids.has(c.category)) throw new Error('有命令引用了不存在的分类。');
      const result = { id: text(c.id, '命令 ID', 120, true), category: c.category, title: text(c.title, '命令名称', 160, true) };
      for (const key of ['description', 'code', 'note', 'context', 'language']) result[key] = text(c[key] ?? '', key, key === 'code' ? 100000 : 10000);
      if (!['server', 'colab', 'other'].includes(c.environment)) throw new Error('运行环境格式不正确。');
      result.environment = c.environment;
      result.warning = c.warning === true;
      return result;
    });
    if (new Set(commands.map(c => c.id)).size !== commands.length) throw new Error('命令 ID 重复。');
    return { version: 2, categories, commands };
  }
  function descendants(library, id) {
    const set = new Set([id]);
    for (let changed = true; changed;) {
      changed = false;
      for (const c of library.categories) if (set.has(c.parent) && !set.has(c.id)) { set.add(c.id); changed = true; }
    }
    return set;
  }
  function path(library, id) {
    const map = new Map(library.categories.map(c => [c.id, c]));
    const parts = [];
    let c = map.get(id);
    while (c && parts.length < MAX_DEPTH) { parts.unshift(c.label); c = map.get(c.parent); }
    return parts.join(' / ');
  }
  function ordered(library, parent = null, depth = 0) {
    return library.categories.filter(c => c.parent === parent).flatMap(c => [{...c, depth}, ...ordered(library, c.id, depth + 1)]);
  }
  function move(library, id, category, beforeId = null) {
    const command = library.commands.find(c => c.id === id);
    if (!command || !library.categories.some(c => c.id === category)) throw new Error('找不到要移动的命令或目标分类。');
    if (id === beforeId) return;
    library.commands = library.commands.filter(c => c.id !== id);
    command.category = category;
    const index = beforeId ? library.commands.findIndex(c => c.id === beforeId && c.category === category) : -1;
    if (index >= 0) library.commands.splice(index, 0, command);
    else library.commands.push(command);
  }
  function mergeMissing(library, additions) {
    const current = validate(library), pack = validate(additions);
    const categories = new Set(current.categories.map(c => c.id));
    const commands = new Set(current.commands.map(c => c.id));
    return validate({
      categories: [...current.categories, ...pack.categories.filter(c => !categories.has(c.id))],
      commands: [...current.commands, ...pack.commands.filter(c => !commands.has(c.id))],
    });
  }
  const api = { validate, descendants, path, ordered, move, mergeMissing, MAX_DEPTH };
  if (typeof module !== 'undefined') module.exports = api;
  else root.CommandModel = api;
})(typeof window !== 'undefined' ? window : globalThis);
