# 贡献指南

[English](CONTRIBUTING.md)

在临时分支修改，向 master 提交 PR。Write 可创建、修改和删除临时分支；Admin 在内容与提交必需检查通过后合并，自己的 PR 不强制第二人审批。合并后自动删除符合条件的源分支。准确的 GitHub 规则和发布权限见 [README](README.zh-CN.md)。

## 环境与验证

```sh
nvm use
npm ci
npm test
# 先在 developer 安装网站依赖
npm run preview -- --port 8051
```

选择空闲端口；网站仓库不在相邻目录时设置 `DEVELOPER_DIR`。受影响页面、媒体、搜索和下载通过 developer 的整站构建及浏览器检查验证，本仓库 CI 校验内容和所属资源。

## 按证据写文档

- 软件指南放入对应型号目录。只有结论适用于所有消费者时才直接共用 partial，否则明确标注型号差异。
- 记录板卡、镜像及构建标识、相关工具和运行库版本、命令、观察结果与验证边界。区分开发安装与原始发布镜像，不从已安装包、算子清单或 TOPS 推导推理正确性。
- 在合适环境验证命令。账号、网络、防火墙和部署行为优先使用只读检查与隔离环境；可能中断访问或重载固件的命令应说明恢复路径与验证范围。
- 截图必须忠实于实际行为，终端文字可读并带替代文本，公开前移除凭据和私有网络信息。命令改变后标明旧证据的时间与范围，不能让旧截图充当新命令已测试的证明。
- 模型、工具和示例链接到各自维护仓库；未单独确认迁移前保留公开附件和跳转。硬件事实及设计资料归本仓库 hardware/。
- 附件旁保留第三方许可证、来源 URL 和哈希；发布压缩包时检查归档校验值及解压内容。

使用普通 Markdown 表格，共用组件负责布局。软件页使用文档链接，迁出的硬件页使用映射跳转。媒体、表格或导航变更后检查手机与桌面布局。README 的每个自然段和列表项在源码中保持单行，不套用提交信息的 72 字符换行规则。

## 提交与 PR

```text
docs(mo62a): clarify the measured runtime compatibility

Explain the evidence or user impact when a title is insufficient.
```

简短英文 Conventional Commit 即可，类型和限制见 [repository-policy.json](config/repository-policy.json)，不要求双语 Message 块。不加 Co-Authored-By、跳过 CI 的指令或内部基础设施信息。`npm ci` 安装本地钩子，CI 再检查 PR 标题和新增非 merge 提交。未发布的临时分支可通过 amend 或交互式 rebase 修正提交，不改写已发布 Tag。

PR 正文说明具体改动、验证及未解决边界。GitHub merge 提交不进入 Changelog 条目。Squash 时使用已校验的标题和合规的可选正文，给 GitHub 自动追加的 PR 编号留出空间，确保最终标题仍不超过 72 字符；rebase 则保留已检查的各条提交作为日志来源。

## 内容规则与架构图

正文调用标准 MDX 组件并引用共享正文/媒体，前端逻辑放在 developer。`validation/` 是固定提交规则的生成副本，不手工修改；先在 developer 修改、测试并提交规则，再导出到本仓库。CI 先核对规则哈希再执行校验。

修改 `scripts/render-architecture.mjs` 后执行 `npm run docs:diagrams`，审查中英 SVG。资料迁移时保留来源、许可、适用范围和路径映射，不将未验证状态改为支持承诺。

## 发布步骤（Admin）

1. 确认选定 master 提交通过必需检查和整站集成预览。
2. 用 `git ls-remote --tags origin` 检查名称未占用，创建普通附注 Tag `VX.Y.Z`；新的 RC 只属于 developer。
3. 检查校验、内容打包和 Release 发布；核对内容包、文件清单、发布元信息和 SHA256SUMS 与选定提交一致。
4. developer 在后续冻结的网站组成中选择该普通版本，mo-docs 没有部署步骤。

手动触发只校验/打包，不发布。保留历史 Tag 和已发布附件；失败草稿不代表完整 Release，重试前检查真实状态。内容修正使用新的普通版本。
