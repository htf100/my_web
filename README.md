# HTF 命令工作台

一个可以直接部署到 GitHub Pages 的个人命令库。纯静态 HTML/CSS/JavaScript，无后端、无构建依赖、无第三方 CDN。原始笔记保留在 `服务器.txt` 和 `colab_common_commands.md`。

## 日常使用

- **1–4 栏**：在工具栏切换栏数。每栏可独立选择任意分类、包含子分类的上级标题或全部命令。点击栏头可设为“当前栏”，点击左侧分类会更新当前栏。栏头的左箭头可交换栏的位置。
- **每栏独立滚动**：桌面端并排浏览，不必跟着最长的一栏一起翻页。窄桌面窗口可横向滚动分栏区域；手机上按栏顺序上下排列。
- **多级标题**：初始 45 条命令和说明已整理为 25 个分类节点。支持最多 6 级标题，左侧可展开/收起；分类下面可以同时放命令和子分类。
- **搜索与筛选**：搜索会匹配名称、代码、备注以及完整分类路径，并与运行环境筛选共同生效。搜索范围为各栏选择的分类。按 `/` 聚焦搜索，`Esc` 清空搜索。
- **一键复制**：保持命令原始内容和换行。浏览器阻止复制时会尝试兼容方式，最后提供选中内容手动复制。网页不会运行命令。

## 顶部国际热点

页面最上方是一条可点击的滚动新闻栏。标题在新标签页打开媒体原文，保留来源标识和发布时间；不转载正文。默认最多 12 条，以中文为主，按最近发布时间排序，不是热度评分榜。

新闻来源：

- [BBC 中文 RSS](https://feeds.bbci.co.uk/zhongwen/simp/rss.xml)：最多 5 条。
- [德国之声中文 RSS](https://rss.dw.com/rdf/rss-chi-all)：最多 5 条。
- [BBC World RSS](https://feeds.bbci.co.uk/news/world/rss.xml)：最多 2 条。

鼠标悬停或点击“暂停”可停止滚动；“新闻列表”提供完整标题、发布时间和来源链接，也方便键盘访问。在系统开启“减少动态效果”时自动改为静态横向浏览。

点击“刷新”可立即检查网站已发布的最新新闻快照。获取期间继续显示旧新闻；失败、空数据、旧快照或没有新增/更新的标题时不清空、不重置弹幕。取得有效新内容后才替换，部分来源失败时保留该来源的旧新闻。最近一次有效新闻会保存在当前浏览器，重新打开页面时也能继续显示。“刷新”不会直接触发媒体抓取或 GitHub Actions；媒体抓取仍按下面的计划执行。

GitHub Actions 在每小时第 17 分钟计划抓取，并重新部署；GitHub 高负载时可能延迟。浏览器每 5 分钟检查同站 `news.json`，不直接跨域请求媒体，不需要 API Key 或第三方 RSS 代理。网站新闻数据更新不会修改你的浏览器命令库。

抓取支持 RSS 2.0 和 RDF RSS，限制响应大小，拒绝 XML 实体、非媒体链接、超过 7 天或明显未来的文章，并去重。单个来源故障仍显示其他来源；全部失败时优先沿用已上线的快照，保留真实抓取时间。超过 3 小时未更新或新闻本身较旧时会显示提示，不伪装成实时新闻。

GitHub 对公开仓库连续 60 天无活动可能停用定时任务。如果栏上持续提示“更新延迟”，到仓库 Actions 重新启用工作流并运行一次。定时任务只发布产物，不生成每小时 Git 提交。[GitHub 定时任务说明](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule)

本地手动刷新新闻快照：

```bash
python3 scripts/update_news.py
```

仅依赖 Python 标准库。`news-data.js` 是供直接打开本地文件时使用的快照，`news.json` 供已打开的网页检查更新。自动部署生成的新快照在发布产物内，不反向改动仓库中的初始快照。

实现参考：[CSS 动画暂停](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/animation-play-state)、[减少动态效果](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion)。

## 设置密令并编辑

1. 第一次点击右上角“设置密令”，输入两遍自己的密令（至少 6 位）。
2. 解锁后可以添加、编辑、删除命令，管理分类，或导入备份。
3. 卡片左上角的拖动柄可以拖到其他分类、其他栏或另一条命令前面。点击“移动”也可选择目标分类和放置位置，适用于手机或键盘操作。
4. “管理分类”中可添加一级标题或子分类、重命名、修改上级、上移同级顺序、删除分类。删除时会明确显示包含的子分类和命令数量。
5. 修改立即保存到当前浏览器；本次会话可撤销最近 20 次修改（包括删除和导入）。锁定或刷新后撤销历史清空，保存的数据仍在。
6. 右上角“锁定”结束编辑。每次刷新或重新打开页面都需要重新输入密令。

**密令仅是本地编辑操作锁，不是网站访问控制，也不加密命令。** 它使用带随机盐的 PBKDF2-SHA256（150,000 次）派生值校验，不保存密令原文；能操作浏览器存储的人仍可绕过本地操作锁。无需把密令发给任何人，也不要写入 GitHub 仓库。

## 保存、备份和迁移

- 数据通过 `localStorage` 保存在当前浏览器、当前网站来源下，不会上传 GitHub，也不会同步到另一台设备。
- **定期点击“导出备份”**，得到包含完整分类与命令的 JSON。导出不需要解锁，也不会包含密令或其校验值。
- 换设备时，在新浏览器设置当地的编辑密令，点击“导入”，选择 JSON，确认替换。导入保留当前浏览器的密令，并可在当前编辑会话内撤销。
- 清理网站数据、无痕窗口关闭、更换浏览器或网站域名都可能导致本地内容不可见。先导出备份再迁移；从本地文件切换到 GitHub Pages 也要导出/导入。
- 同一来源下的本网站实例共享命令库，例如同一个 `username.github.io` 下的不同仓库路径。不同浏览器或不同域名各自独立。
- 浏览器空间不足时修改不会生效，页面会提示保存失败。其他标签页修改了命令库时，当前页会锁定并提示刷新，避免旧内容覆盖新内容。
- 忘记密令：先在只读状态导出 JSON。然后在浏览器网站数据设置中清除此网站的本地存储，重新打开、设置新密令，再导入备份。不要在备份前清理数据。

## 本地打开

可以直接打开 `index.html`。为获得稳定的存储来源和剪贴板行为，推荐在此目录运行：

```bash
python3 -m http.server 8080 --bind 127.0.0.1
```

浏览器访问 <http://localhost:8080>。密令功能需要浏览器 Web Crypto 支持（现代浏览器的 HTTPS、localhost 或受信任的本地文件环境）。不要通过普通远端 HTTP 访问后期待密令功能可用。

## GitHub 仓库与自动部署

仓库：<https://github.com/htf100/my_web>

网站地址：<https://htf100.github.io/my_web/>

仓库包含 `.github/workflows/pages.yml`。向 `main` 分支推送后，GitHub Actions 会检查 JavaScript、运行数据层测试，抓取最新 RSS 新闻，并只发布网站所需的静态文件。原始笔记、旧版备份、截图和 ZIP 留在本地，不提交也不发布。

仓库 **Settings → Pages → Build and deployment → Source** 应设为 **GitHub Actions**。可在仓库 Actions 页面查看部署进度或手动运行部署流程。

后续修改网页代码后，在项目目录执行：

```bash
git add index.html styles.css app.js model.js commands.js news.js news-data.js news.json scripts README.md .github tests
git commit -m "Update command desk"
git push origin main
```

无需安装依赖或本地构建，资源均使用相对路径，支持仓库路径 `/my_web/`。初始命令数据包含原笔记中的服务器 IP；发布后的初始 `commands.js` 和页面可被公开读取。你通过网页新增的本地命令只留在当前浏览器。

如果已经在本地网页里添加了内容，请先导出 JSON，再到 GitHub Pages 网站导入。本地文件、localhost 和 GitHub Pages 属于不同的浏览器存储来源。

官方部署说明：<https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages>

## 文件说明

- `commands.js`：初始命令库；有本地保存后优先读取浏览器数据，修改此文件不会覆盖已保存内容。
- `model.js`：分类树、移动逻辑和数据校验。
- `app.js`：界面交互、密令、本地保存、导入导出。
- `backups/v1/`：升级前的第一版文件。
- `tests/model.test.cjs`：分类树、异常备份和移动操作验证。

JSON 备份格式为 `{ "format": "htf-command-desk", "version": 2, "library": { "version": 2, "categories": [...], "commands": [...] } }`。分类用 `parent: null` 表示一级标题，其他级别填上级分类 ID。界面通过文本节点显示输入内容，不执行用户添加的 HTML/JavaScript。

运行数据层测试：

```bash
node --test tests/model.test.cjs
```
