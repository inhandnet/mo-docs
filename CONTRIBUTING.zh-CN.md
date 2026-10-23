# 贡献指南

[English](CONTRIBUTING.md)

在临时分支修改，向 master 提交 PR。Write 可创建、修改和删除临时分支；Admin 在三个必需检查通过后合并，自己的 PR 不强制第二人审批。合并后自动删除符合条件的源分支。准确的 GitHub 规则和发布权限见 [README](README.zh-CN.md)。

## 环境与验证

```bash
nvm use
npm ci
npm test
npm run typecheck
npm run build
npx playwright install chromium
npm run test:browser
```

交互预览使用空闲端口。浏览器检查动态分配端口，运行时必须沿用构建所用的域名、base path、主站和硬件站变量。验证发布目标可用 `node scripts/build-site.mjs test --verify` 或 `node scripts/build-site.mjs production --verify`。

## 按证据写文档

- 软件指南放入对应型号目录。只有结论适用于所有消费者时才直接共用 partial，否则明确标注型号差异。
- 记录板卡、镜像及构建标识、相关工具和运行库版本、命令、观察结果与验证边界。区分开发安装与原始发布镜像，不从已安装包、算子清单或 TOPS 推导推理正确性。
- 在合适环境验证命令。账号、网络、防火墙和部署行为优先使用只读检查与隔离环境；可能中断访问或重载固件的命令应说明恢复路径与验证范围。
- 截图必须忠实于实际行为，终端文字可读并带替代文本，公开前移除凭据和私有网络信息。命令改变后标明旧证据的时间与范围，不能让旧截图充当新命令已测试的证明。
- 模型、工具和示例链接到各自维护仓库；未单独确认迁移前保留公开附件和跳转。硬件事实及设计资料归 mo-hardware。
- 附件旁保留第三方许可证、来源 URL 和哈希；发布压缩包时检查归档校验值及解压内容。

使用普通 Markdown 表格，共用组件负责布局。软件页使用文档链接，迁出的硬件页使用映射跳转。媒体、表格或导航变更后检查手机与桌面布局。README 的每个自然段和列表项在源码中保持单行，不套用提交信息的 72 字符换行规则。

## 提交与 PR

```text
docs(mo62a): clarify the measured runtime compatibility

Explain the evidence or user impact when a title is insufficient.
```

简短英文 Conventional Commit 即可，类型和限制见 [repository-policy.json](config/repository-policy.json)，不要求双语 Message 块。不加 Co-Authored-By、跳过 CI 的指令或内部基础设施信息。`npm ci` 安装本地钩子，CI 再检查 PR 标题和新增非 merge 提交。未发布的临时分支可通过 amend 或交互式 rebase 修正提交，不改写已发布 Tag。

PR 正文说明具体改动、验证及未解决边界。GitHub merge 提交不进入 Changelog 条目。Squash 时使用已校验的标题和合规的可选正文，给 GitHub 自动追加的 PR 编号留出空间，确保最终标题仍不超过 72 字符；rebase 则保留已检查的各条提交作为日志来源。

## 发布快照与架构图

`npm run fetch-data` 显式更新 `src/data/generated/releases.json`，审查完整差异，尤其是仓库身份、正式版/候选版选择和日期。失败保留原文件并非零退出；内容不变时不更新时间戳。不手工虚构缺失的 Release，也不猜测 ChangeLog 路径。

修改 `scripts/render-architecture.mjs` 后运行它，更新 `architecture/` 中的中英 SVG；两种语言都检查桌面与手机预览。架构图的可编辑来源是生成代码，不是位图截图。

## 发布步骤（Admin）

1. 确认选定 master 提交已通过必需检查、改动已审阅，并检查该 Tag 会触发的每个环境是否已配置部署条件。
2. 用 `git ls-remote --tags origin` 检查远端 Tag，再创建和推送 annotated `VX.Y.Z-rcN` 或 `VX.Y.Z`。Tag 推送后由 CI 校验，本地不拦截 Tag 创建。
3. 检查验证、打包、发布和部署任务，下载核对 `SHA256SUMS` 与 `release.json`，再确认在线 `deployment.json` 对应 Tag 的提交。
4. 发布或部署失败时先检查实际 Release 与服务器状态；不得改写既有 Tag 或已发布附件，内容修正使用下一个 RC 或版本。

手动 workflow dispatch 只验证和打包，不发布或部署。中文标题版 Changelog 保留英文条目，不依赖翻译服务。正式平台是否就绪由实际基础设施配置与部署验证决定，不能只凭正式构建成功判断。
