# windangle-dsh-plugins

我自己做的 **DeepSeek Harness 插件集合**。

每个插件占一个目录，各自是独立可安装的 bundle（`package.json` + `cordis.patch.yml`）。可以只装其中一个，也可以全部装上——彼此不冲突。

## 插件一览

| 插件 | 一句话 | 目录 | 状态 |
|---|---|---|---|
| **SuperAgentTeam 超级智能体团队** | 给 Agent Teams 补上「自动派活 + 人工硬闸」两层，并在其上叠加 Agent 公司组织治理层：CEA 立案、岗位与 PM、董事长验收闭环 | [super-agent-team/](super-agent-team/) | 活跃开发 · 7 个测试套件 / 286 项断言 |
| **personal-workbench 个人工作台** | 纯客户端侧栏面板：四列任务看板 + 常用网址导航，数据只存本机浏览器 | [personal-workbench/](personal-workbench/) | 可用 · 暂无自动化测试 |

两个插件的 bundle id、slot id、locale 命名空间、存储键、工具与命令名**均不重叠**，可以同时装在同一个 DSH profile 里。

各插件的完整产品介绍、命令表与已知边界，见各自目录里的 README。

## 目录结构

```
windangle-dsh-plugins/
├── README.md                  ← 本文件：总览
├── LICENSE                    ← MIT，覆盖仓库内所有插件
├── .gitignore
├── super-agent-team/          ← 插件一（自带 README、docs、7 个测试）
│   ├── README.md  index.js  client.js  package.json  cordis.patch.yml
│   └── locale/  icon.svg  docs/  test/
└── personal-workbench/        ← 插件二
    ├── README.md  index.js  client.js  package.json  cordis.patch.yml
    └── locale/  icon.svg
```

## 安装

前置：启用官方 Agent Teams 底座。`plugin_manager` 是**模型工具**而不是 shell 命令，安装动作由它完成（不要手改 profile 目录、不要手写 `cordis.patch.yml`）。

```bash
git clone https://github.com/windangle/windangle-dsh-plugins.git
```

```text
# ① 启用底座
plugin_manager({ action: "set_bundle",
                 target: "@deepseek-ai/dsh-experimental-agent-team-profile",
                 enabled: true })

# ② 按需安装插件（target 指向对应的插件子目录）
plugin_manager({ action: "install_bundle",
                 target: "<仓库路径>/super-agent-team",
                 enabled: true })

plugin_manager({ action: "install_bundle",
                 target: "<仓库路径>/personal-workbench",
                 enabled: true })
```

> `target` 指向**插件子目录**，不是仓库根——仓库根不再是 bundle 根。
> DSH 默认 profile 未开启 Agent Teams，未开启时插件保持 `pending` 而非报错。
> 同一个路径重复安装会报 `already-installed`，先 `remove_bundle` 再装。
> `plugin_manager` 每次调用都需要审批，只在该动作的结果会影响下一步时才调它。

## 约定

- 包名统一用 `@local/<目录名>`，bundle id 与目录名一致。
- 全部 `"private": true`，不发 npm；通过本地 `link:` 依赖安装。
- 不引入裸依赖（Config schema 手写 Standard Schema，不依赖 zod）——link 安装的 bundle 解析不了裸依赖。
- 每个插件自带 README；本文件只做总览。

## 测试

在 `super-agent-team/` 下运行：

```bash
node test/host.test.mjs
node test/contract.test.mjs
node test/render.test.mjs
node test/render-ui.test.mjs
node test/features.test.mjs
node test/company.test.mjs
node test/company-panel.test.mjs
```

共 **286 项断言**。`personal-workbench` 暂无自动化测试。

## License

MIT —— 见 [LICENSE](LICENSE)。

设计文档与评审记录保留在本地工作区，不随仓库发布；已发布的界面截图见 `super-agent-team/docs/`。
