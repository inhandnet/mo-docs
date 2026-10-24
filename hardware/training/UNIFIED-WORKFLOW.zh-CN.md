# 在统一网站架构下维护硬件资料

本页适用于内容迁入 mo-docs 后的流程。原培训的截图与详细练习继续保留；截图中的 mo-hardware、独立 Pages 和旧部署流程是历史状态。

1. 打开 [mo-docs](https://github.com/inhandnet/mo-docs)，从最新 master 创建主题分支；普通作者申请 Write 权限，合并与 Tag 发布由 Admin 执行。
2. 在 `hardware/products/` 或 `hardware/accessories/` 定位原始资料。机械页示例为 `hardware/products/mo62a/mechanical/mechanical.en-US.md`。先核对型号、资料版本、来源与许可。
3. 编辑 Markdown 正文或上传附件；仅改变本次有依据的事实，不将规格等同于测试结果。附件旁保留来源说明和校验值。
4. 新页面或公开附件在仓库根目录 `content/hardware-map.json` 登记。图片与附件也在该映射中登记，不再复制一份手工维护文件；网站正式发布前不保留旧地址。培训、模板不放入产品导航。
5. 提交采用简短英文 Conventional Commit，例如 `docs(mechanical): clarify the assembly reference`；不写凭据、内网地址或跳过 CI 的指令。
6. 向 mo-docs master 提交 PR，说明变动、证据、影响的页面/附件和未验证范围。`commit-message` 与 `validate-content` 必须通过。
7. 请网站维护者在 developer 集成预览中选用此 PR 的准确提交 SHA。检查目标页面、来源链接、附件哈希、桌面/手机、旧 URL 和搜索；网页作者不需要维护 React 或另建网站。
8. Admin 在检查通过后合并；合并本身不意味着测试站已部署。需要发版时先检查远端 Tag 未占用，再在已验收 master 提交创建普通附注 Tag `VX.Y.Z`。
9. 检查 mo-docs 内容 Release 的 archive、content-manifest.json、release.json 和 SHA256SUMS。新子库版本不使用 RC，也不直接部署网站。
10. developer 后续冻结该内容版本与其他业务仓库版本的组成，构建整站 RC，在测试平台验收后显式晋级正式版。发布失败或需要回退由 developer 使用保留的整站产物处理，历史 Tag 不改写。

本地作者可在 mo-docs 执行 `npm ci && npm test`，然后通过 `npm run preview -- --port 8051` 调用相邻 developer 工作区；网站依赖只在 developer 安装。仓库位置不相邻时设置 `DEVELOPER_DIR`，选择实际空闲端口。

继续阅读[原网页操作图解](github-workflow.zh-CN.md)、[机械资料练习](examples/mechanical-review/README.zh-CN.md)和[贡献指南](../../CONTRIBUTING.zh-CN.md)。原图解的具体按钮仍可参考，但仓库、路径、检查名称和发布步骤以本页为准。
