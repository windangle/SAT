# personal-workbench 个人工作台

一个纯客户端的 DeepSeek Harness 面板插件：在侧栏加一个「个人工作台」，把**任务看板**和**常用网址导航**放在一处。数据只存在本机浏览器里，不联网、不注册任何 Host 工具或命令。

## 功能

**任务看板** —— 四列看板：待办 / 进行中 / 待验证 / 已完成。

- 任务可设优先级（紧急 / 高 / 普通 / 低），用彩色圆点区分
- 逗号分隔的标签，输入时自动提示已有标签
- 详情弹窗支持描述与**任务进展记录**（增删改，带时间戳）
- 一键换列；支持 Esc 关闭（含输入法保护）

**办公导航** —— 常用网址的增删改与拖拽排序；添加或编辑时若 URL 重复会给出提示。

**中英双语** —— 界面跟随系统语言切换，词条在 `locale/en.json` 与 `locale/zh.json`。

## 数据说明

数据保存在浏览器 `localStorage` 的 `personal-workbench:v1` 键下，**只在本机、只在这个浏览器**。插件不请求网络、不调用任何 Host 服务，也没有服务端逻辑。首次打开会写入 4 条示例任务和 6 个示例书签（均为公开网址，可自行删改）。

清除浏览器站点数据会一并清掉看板内容；插件不提供导出/备份。

## 结构

| 文件 | 作用 |
|---|---|
| `client.js` | 全部实现：界面组件、i18n 词条、localStorage 持久化、slot 注册 |
| `index.js` | Host 侧入口，空实现（渲染完全由客户端模块负责） |
| `cordis.patch.yml` | bundle 声明：`@local/personal-workbench` |
| `locale/*.json` | 中英文案 |
| `icon.svg` | 侧栏图标 |

注册的槽位：`sidebar.panellist`（id `personal-workbench`，order 10）与 `main`（key `personal-workbench`）。语言命名空间为 `@local/personal-workbench`。

**没有定义任何工具或命令**，因此不会与同仓库的其他插件抢名字；`super-agent-team` 与本插件可以同时装在同一个 DSH profile 里（bundle id、槽位 id、locale 命名空间、存储键均不冲突）。

## 安装

先启用 Agent Teams 底座，再用 `plugin_manager` 安装本目录（`target` 填本目录的绝对路径）：

```text
plugin_manager({ action: "set_bundle",
                 target: "@deepseek-ai/dsh-experimental-agent-team-profile",
                 enabled: true })

plugin_manager({ action: "install_bundle",
                 target: "<本仓库路径>/personal-workbench",
                 enabled: true })
```

完整说明见仓库根目录的 [README](../README.md)。

## 已知边界

- 没有自动化测试；功能在离线渲染层面验证过，真机验收未单独记录。
- 无服务端、无同步、无跨设备能力；数据仅在本机浏览器。
- 示例书签使用公开网址，可按自己的习惯替换 `client.js` 里的 `links` 种子数据。

## License

MIT —— 见仓库根目录的 [LICENSE](../LICENSE)。
