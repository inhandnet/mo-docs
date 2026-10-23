# Mo 软件文档

[English](README.md)

本仓库维护 Mo 系列的软件文档：准备开发板、安装和使用 Mo OS、开发 AI 与外设应用，以及选择相互兼容的工具、模型和示例。网站基于 Docusaurus 3、Node.js 22 独立构建，部署在开发者平台的 `/docs/`。

| 环境 | 地址 | 更新方式 |
|---|---|---|
| 测试平台 | [developer.inhand.online/docs/](https://developer.inhand.online/docs/) | 发布候选版与正式版 |
| 正式平台目标 | [developer.inhand.com/docs/](https://developer.inhand.com/docs/) | 仅正式版；需要配置部署基础设施与凭据 |
| GitHub Pages 预览 | [inhandnet.github.io/mo-docs/](https://inhandnet.github.io/mo-docs/) | 集成后的 master；显示预览提示，不参与搜索引擎索引 |

## mo-docs 内部架构

![内容、组件、数据与构建架构](architecture/documentation.zh-CN.svg)

| 层次 | 位置 | 职责 |
|---|---|---|
| 使用指南 | `docs/mo-*/`、`docs/security/`、`docs/works-with-mo/` | 各型号操作说明、实测软件边界和参考资料 |
| 共用内容 | `docs/_partials/` | 复用 MDX；硬件与软件结论仍限定在实际证据范围内 |
| 导航与渲染 | `sidebars.ts`、`src/components/`、`src/theme/` | 文档链接、表格、镜像下载、硬件跳转与搜索界面 |
| 发布数据 | `src/data/generated/releases.json` | 经审阅并提交的 GitHub Releases 快照 |
| 公开附件 | `static/img/`、`static/downloads/` | 截图、图示、授权媒体、示例源码和验证证据 |
| 网站构建 | `docusaurus.config.ts`、`plugins/`、`scripts/` | 路由、共用样式、Pagefind 索引、环境配置和部署标记 |
| 验证与交付 | `tests/`、`.github/workflows/` | 内容、脚本、发布、浏览器和布局检查；预览与发布流水线 |

集成有三种实际路径：普通链接指向上游维护的源码和发布物；`npm run fetch-data` 显式刷新本地发布快照，审阅后提交，普通构建不自动更新；Mo62A 镜像下载控件在浏览器查询最新 GitHub Release，仅接受同一正式发布中完整的镜像与校验文件组合，查询失败时提供发布历史入口，不从不同版本拼接附件。

硬件资料由 **mo-hardware** 维护。33 条旧硬件地址继续提供跳转，保留查询参数、锚点与不依赖 JavaScript 的备用链接；旧公开下载地址继续兼容。硬件跳转页不进入软件文档的搜索索引。

## Mo 系列仓库协同

![仓库职责与资源集成](architecture/repository-map.zh-CN.svg)

| 仓库 | 维护内容 | mo-docs 如何使用 |
|---|---|---|
| **developer** · GitLab | `/` 下的主站、产品介绍、导航、下载入口、社区与联系页面 | 共用平台导航和入口 |
| [mo-docs](https://github.com/inhandnet/mo-docs) | `/docs/` 下的软件指南和证据 | 本仓库 |
| [mo-hardware](https://github.com/inhandnet/mo-hardware) | `/hardware-docs/` 下的接口、原理图、机械、配件与合规资料 | 直接链接与旧地址跳转 |
| **Mo\*** · 产品仓库 | 每型号独立 BSP、启动组件、内核、根文件系统、镜像集成及构建/烧录工具 | 版本化镜像、SDK 集成和源码引用，例如 [Mo62A](https://github.com/inhandnet/Mo62A) |
| [mo-models](https://github.com/inhandnet/mo-models) | 模型元数据、`.link` 下载引用、编译、兼容性与基准记录 | 选择模型、追溯来源和匹配产物；模型二进制独立托管 |
| [mo-tools](https://github.com/inhandnet/mo-tools) | 工具链版本约定、主机环境配置与板测工具 | 可复现的开发和验证环境 |
| [mo-examples](https://github.com/inhandnet/mo-examples) | 可运行的 AI、相机与应用示例 | 教程源码及应用侧示例 |

`Mo*` 表示 Mo 系列每个型号独立的 BSP 与系统镜像仓库，不限定型号仓库数量。三个网站独立构建和部署，各自只更新所属目录。来源仓库发布新版本，不会自动重建网站，也不会自动发布其他仓库。

各仓库独立管理版本。文档应记录**经过验证的组合**：镜像、板卡版本、SDK、TIDL 编译器、目标运行库与固件、模型图与编译产物、工具版本和应用配置。不同仓库不要求版本数字相同，数字相同也不能证明兼容。开发板上的观测不能自动代表未经修改的发布镜像；Mo62A 的测试不能推广成其他型号的结论。

## 仓库权限与保护

| 操作 | Write | Admin |
|---|---|---|
| 创建、修改、删除临时分支 | 允许 | 允许 |
| 向 master 提交 PR | 允许 | 允许 |
| 合并到 master | 不允许 | 必需 CI 通过后允许 |
| 合并自己的 PR | 不允许 | 同样通过检查，不强制第二人审批 |
| 直接推送、强推或删除 master | 不允许 | 由无绕过的 PR/检查规则阻止 |
| 创建远端 Tag 并启动发布 | 不允许 | 允许；推送后由 Tag CI 校验 |

GitHub 保留**两条 master 规则和一条全 Tag 规则**。权限与合并检查分开，是因为 bypass 会作用于整条 ruleset。

| Ruleset | 范围 | 规则与 bypass |
|---|---|---|
| `admin-only-master-updates` | `refs/heads/master` | 限制创建、更新、删除和强推，仅 Admin 可 bypass |
| `master-pr-and-required-checks` | `refs/heads/master` | 必须 PR、与主线同步的必需检查、禁止删除与强推；**无 bypass**；审批数为 0 |
| `admin-only-tags` | 所有 Tag | 限制创建、更新、删除和强推，仅 Admin 可 bypass |

必需检查为 `commit-message`、`validate-and-build-public`、`validate-and-build-office-preview`。临时分支没有额外 ruleset 限制。PR 合并后自动删除符合条件的源分支。保留 merge、squash 和 rebase；选择 squash 时使用已校验的 PR 标题及合规的可选正文，并为 GitHub 自动追加的 PR 编号留出标题长度。

本地钩子提供即时反馈，但可以被本地绕过，CI 才是合并门槛。能够更改仓库设置的管理员仍是受信任操作者；Tag 规则中的 Admin bypass 也允许行政修改 Tag。因此，**不改写或删除已发布 Tag 和 Release** 是本流程必须遵守的操作约定，修正使用新 RC 或新版本。不安装本地或服务器 Tag 创建钩子；非法 Tag 可以出现在远端，但 CI 会在发布前失败。

## 英文提交与 Changelog

```text
fix(download): keep the image and checksum on the same release
```

一行英文 Conventional Commit 即可，正文按需使用英文。类型为 `feat`、`fix`、`perf`、`docs`、`style`、`refactor`、`test`、`build`、`ci`、`chore`、`revert`、`sync`；小写 scope 可选。标题不超过 72 字符，描述以小写字母开头、不加句号。正文前空一行，普通正文按 72 字符换行，URL 和缩进代码除外。不得包含凭据、内部基础设施信息、`Co-Authored-By` 或跳过 CI 的标记。

`npm ci` 会安装当前克隆的 `commit-msg` 和 `pre-push` 钩子，`git commit`（包括 `git commit -m`）时立即校验。CI 再检查 PR 标题及新增的非 merge 提交，不改写策略边界之前的历史。规则来源为 [repository-policy.json](config/repository-policy.json) 与 [policy.mjs](scripts/lib/policy.mjs)。

两份发布日志的条目都保留英文，只固定翻译标题和分类，例如 Features / 新功能、Fixes / 修复、Documentation / 文档。历史 `Message: en` 与 `Message.en:` 英文摘要继续兼容，新提交不需要双语块。[generate-changelog.mjs](scripts/generate-changelog.mjs) 从上一个**正式版本**计算提交范围，RC 与正式版都包含完整变更，不从上一个 RC 截断。

### 翻译 API（占位）

| 平台 | 翻译服务器 | 状态 |
|---|---|---|
| GitLab | - | 后续接入 |
| GitHub | - | 后续接入 |

此表保留未来翻译变更条目的入口。当前生成器不调用翻译 API，也不需要翻译凭据。

## 从修改到发布

![PR 检查、预览、发布与环境部署](architecture/release-flow.zh-CN.svg)

1. 在临时分支修改并提交 PR。CI 校验提交、测试、TypeScript，以及 `/docs/` 公开构建和根路径预览构建；两种构建都运行浏览器检查并提供可下载的审阅产物。
2. Admin 在必需检查通过后合并，GitHub Pages 从 master 自动更新。PR 提供构建附件，没有各自独立的 Pages 站点。合并不会部署产品测试站或正式站。
3. Admin 在已审阅的 master 提交上推送 annotated Tag，格式为 `VX.Y.Z-rcN` 或 `VX.Y.Z`。所有推送的 Tag 都进入发布工作流，检查准确格式、注释 Tag、主线祖先关系和提交规范。
4. CI 分别构建、验证测试和正式目标，归档内写入部署标记，生成 Changelog，通过 draft 发布完整的 GitHub Release。
5. 测试部署等待 Release 发布成功；正式版再等待测试部署成功后部署正式站。每次检查归档校验值并回读在线 `deployment.json`，缺配置或版本不符会使对应任务失败。

| Tag | GitHub Release | 测试站 | 正式站 |
|---|---|---|---|
| `V1.2.3-rc1` | Prerelease | 自动部署 | 不部署 |
| `V1.2.3` | 正式发布 | 自动部署 | 测试部署成功后自动部署 |

格式必须使用大写 `V`、三个无前导零的数字分量，可选小写 `-rcN`，N 从 1 开始。Tag 决定网站发布版本；`package.json` 与 lockfile 表示构建工程自身版本，二者必须一致。手动 `workflow_dispatch` 仅从 master 祖先提交验证和打包候选，不创建 Release，也不部署。

附件包括 `mo-docs-VERSION-test.tar.gz`、`mo-docs-VERSION-production.tar.gz`、`release.json`、`CHANGELOG.en.md`、`CHANGELOG.zh-CN.md`、`release-notes.md` 和 `SHA256SUMS`。环境后缀避免把错误 canonical 地址与跨站导航带到另一环境。既有 Release 文件名和 Tag 不变。

Release 已发布不代表部署成功；宣布上线前应检查部署任务和在线版本。正式环境还需要 `OPS_PROD_*` 凭据与服务器适配器，目前仓库只配置了测试部署凭据。[ARCHITECTURE.md](ARCHITECTURE.md) 说明适配器契约和环境变量。

## 本地开发

```bash
nvm use
npm ci
npm start -- --port 8051
```

已有预览运行时选择空闲端口。预览构建产物可用 `npx docusaurus serve --host 127.0.0.1 --port 8051 --no-open`。

| 命令 | 用途 |
|---|---|
| `npm test` | 内容、数据、治理、发布与下载脚本回归 |
| `npm run typecheck` | TypeScript 检查 |
| `npm run build` | 使用已提交内容构建 build/，包含 Pagefind 和部署标记 |
| `npm run build:test` / `npm run build:production` | 使用准确的目标域名和 `/docs/` 构建 |
| `npm run test:browser` | 在动态分配的本地端口验证当前构建 |
| `npm run fetch-data` | 显式刷新发布元数据；失败保留原快照并非零退出 |
| `node scripts/render-architecture.mjs` | 从维护的源码重新生成中英 SVG 架构图 |

浏览器测试先用 `npx playwright install chromium` 安装 Chromium，运行时沿用构建使用的环境变量。内容和验证约定见 [CONTRIBUTING.zh-CN.md](CONTRIBUTING.zh-CN.md)，技术细节见 [ARCHITECTURE.md](ARCHITECTURE.md)，安全报告见 [SECURITY.md](SECURITY.md)。仓库内容采用 CC BY-SA 4.0，第三方素材保留 [static/ASSETS.md](static/ASSETS.md) 及相邻来源文件中的声明。
