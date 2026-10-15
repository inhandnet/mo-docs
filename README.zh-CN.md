# Mo 系列文档

[English](README.md) | 简体中文

`mo-docs` 是映翰通（InHand）Mo 系列单板计算机的文档仓库，提供板卡入门、操作系统配置、应用开发及硬件接口使用的指南与参考资料。

[阅读文档](https://inhandnet.github.io/mo-docs/) · [反馈文档问题](https://github.com/inhandnet/mo-docs/issues/new/choose) · [许可证：CC BY-SA 4.0](LICENSE)

## 如何使用

访问[文档网站](https://inhandnet.github.io/mo-docs/)，选择你的板卡，从 **Getting started** 开始。其他栏目提供系统配置、硬件参考、开发指南，以及版本发布和资源下载链接。操作前请确认页面说明的适用板卡和软件版本。

文档网站目前为预览版本。标记为 **Coming soon** 的页面尚未提供完整内容。

Markdown 和 MDX 源文件位于 [`docs/`](docs/)。本仓库维护文档及其网站源码；系统镜像等下载资源通过相关指南中的链接获取。

## 参与贡献

欢迎修正文档、补充示例或编写新文档。

1. Fork 本仓库；如果已有写入权限，也可以直接创建工作分支。请基于最新的 `master` 开始修改。
2. 编辑或新增 `docs/` 中的相关文件。每次修改保持聚焦，并说明适用的板卡和软件版本。
3. 检查修改内容。GitHub 会自动检查 PR；也可以使用下方命令在本地预览和测试。
4. 按照[提交信息规范](#提交信息规范)创建提交。
5. 向 `master` 发起 Pull Request，说明修改内容和验证方式。

如果只是反馈问题，可以[创建文档 Issue](https://github.com/inhandnet/mo-docs/issues/new/choose)，提供页面链接、相关板卡及软件版本，以及问题描述。请勿在公开 Issue 中包含凭据或其他敏感信息；安全相关问题请参阅 [SECURITY.md](SECURITY.md)。

请仅提交你有权按照相应许可证分享的内容。修改本 README 时，请同步更新[英文版本](README.md)。

### 直接在 GitHub 编辑和构建

参与贡献不需要将仓库克隆到本地。在 GitHub 上创建工作分支或 Fork 后，打开要修改的文件，点击铅笔按钮进行编辑。对于本 README 这样的 Markdown 文件，可以在提交前点击 **Preview** 查看排版效果。

按照下方规范提交到工作分支，再向 `master` 创建 PR。GitHub Actions 会自动执行检查和文档构建；PR 合并后，自动发布更新后的文档网站。

GitHub 的 Markdown 预览不会渲染完整文档网站及其 MDX 组件。目前 PR 提供构建和浏览器检查，尚不提供独立的在线预览地址。

### 本地预览（可选）

安装 [`.nvmrc`](.nvmrc) 指定的 Node.js 24，然后运行：

```bash
git clone https://github.com/inhandnet/mo-docs.git
cd mo-docs
npm ci
npm start
```

打开 http://localhost:8041。开发服务器会在源文件发生变化时自动刷新。

如需预览包含全文搜索的构建版本，请运行：

```bash
npm run build
npm run serve
```

打开 http://localhost:8040。全文搜索索引在构建时生成，开发服务器不提供全文搜索。

### 运行检查

```bash
npm run check
npx playwright install --with-deps chromium
npm run test:browser
```

`npm run check` 执行文档测试、TypeScript 检查和静态站点构建。浏览器测试针对构建结果验证导航、搜索和响应式布局。首次运行浏览器测试前，需要执行上述 Playwright 安装命令。

### 提交信息规范

Git commit message 和 Pull Request 标题采用以下格式：

```text
<type>(<scope>): <subject>
```

- 允许的 type：`feat`、`fix`、`docs`、`refactor`、`sync`、`ci`、`chore`。
- scope 可省略；填写时使用小写字母、数字和连字符，多级 scope 使用 `/` 分隔。
- subject 以小写英文字母开头，不以句号结尾。
- 完整标题不超过 72 个字符。
- 如需正文，标题与正文之间空一行；正文每行不超过 72 个字符，URL 和缩进代码除外。
- 不得包含私有 IP 地址、仅限内部访问的域名或敏感信息。

示例：

```text
docs: clarify the first-boot instructions
fix(docs): correct a download link
ci: update documentation checks
```

[提交信息工作流](.github/workflows/commit-message.yml)通过 [`scripts/check-commit-msg.sh`](scripts/check-commit-msg.sh) 执行检查，同时检查 PR 标题和 PR 中的提交。采用 Squash 合并时，最终提交信息也必须符合规范。

### GitHub 合并规则

`master` 是默认分支，仅通过 Pull Request 接收修改。合并前，工作分支须与最新的 `master` 保持同步，且以下检查全部通过：

- `commit-message`
- `validate-and-build-public`
- `validate-and-build-office-preview`

禁止直接推送、强制推送或删除 `master`。修改合并到 `master` 后，自动触发文档构建和网站发布。

## 许可证

文档采用 **知识共享署名—相同方式共享 4.0 国际许可协议（CC BY-SA 4.0）**。完整条款见 [LICENSE](LICENSE)。

第三方组件和素材保留各自适用的许可证及声明。仓库附带的 Roboto 字体采用 [SIL Open Font License 1.1](src/css/fonts/OFL.txt)。文档许可证不授予使用映翰通商标或标志的权利。
