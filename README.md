# Mo documentation

本仓库只维护 Mo 系列单板计算机的 Documentation，直接复用 ZYB 的 Docusaurus 文档源码。Mo62A、Mo68A、配件、Works with Mo 和 Security 均来自同一原型。核心板不在本仓库范围内。

## 本地预览

要求 Node.js 24（见 .nvmrc）。

```bash
npm ci
DOCS_PREVIEW=1 npm run build
npm run serve
```

访问 http://localhost:8040。同一局域网可通过本机 IP 访问。3030 留给完整 ZYB Developer 原型。服务不包含开机自启。

构建时设置 `DEVELOPER_PORTAL_URL` 可以将 Hardware、Software、Contact 等入口指向本地 ZYB 站点；默认指向正式 Developer 地址。不要将内网 IP 固定写入源代码。

日常编辑用 `npm start`，在 8041 提供热更新；全文搜索需要静态构建。构建参数 `DOCS_BASE_URL` 默认为 `/`，也可部署为 `/docs/`；`DOCS_SITE_URL` 控制正式域名。`DOCS_PREVIEW=1` 显示预览提示、设置 noindex 并禁用 sitemap。该参数不代表内容已完成审核。

## 目录

- `docs/`：ZYB 的 Markdown/MDX 正文及 `_category_.json` 目录顺序。
- `docs/_partials/`：直接复用的共享 MDX，通过板卡参数区分内容。
- `sidebars.ts`：Docusaurus 原生自动侧栏。
- `src/components/DocBlocks/`：ZYB 的 ComingSoon、下载、版本映射和规格组件。
- `src/data/`：ZYB 产品资料与已有发布记录快照。
- `src/components/DocumentationLink/`：将原型中的主站链接适配到独立部署地址。
- `src/css/`：ZYB 样式与本地 Roboto 字体，含来源和 OFL 许可。
- `legacy/`：改用 ZYB 前的稿件与元数据备份，不参与构建。
- `build/`：生成的静态站点，不提交。

编辑真实文档源文件，不再维护自建目录生成器、产品模板或 `.generated/`。新增文档方法见 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 内容状态

本轮先完整复用原型，后续逐页调整。原型的 Coming soon 标记保留；尚未上传的文件、外部下载、规格、版本说明及安全渠道需进一步核对。导入 145 个页面不等于 145 篇文档已验收。

发布记录使用原型自带的快照；构建不自动联网刷新。需要更新时运行原型的 `npm run fetch-data`，检查差异后提交。构建成功不等于上游链接或硬件操作已核验。

## 检查

```bash
npm run check
DOCS_PREVIEW=1 npm run build
DOCS_PREVIEW=1 npm run test:browser
```

浏览器测试参数必须与构建一致，包括 `DEVELOPER_PORTAL_URL` 和 `DOCS_BASE_URL`。首次运行需安装 Playwright Chromium。CI 检查公开 /docs/ 与办公室预览 /，GitHub Pages 工作流另行检查实际发布路径。

## 自动编译与发布

- **在线预览**：`pages-preview.yml` 在 PR 合并到 master 后自动检查、编译并发布到 GitHub Pages，预期地址为 https://inhandnet.github.io/mo-docs/。域名和路径读取 Pages 配置，不硬编码在源码中。预览保留提示栏和 noindex；noindex 不是访问控制，预览页面公开可访问。
- **官网接口（dummy）**：`build.yml` 生成 `mo-docs-public-<commit SHA>` 静态产物，`website-deploy-dummy` 只在 Actions Summary 记录目标与交接说明，不连接官网服务器、不上传官网，也不需要官网凭据。
- **办公室预览**：本地 8040 独立运行，不随 GitHub 发布改变；3030 仍是完整 ZYB Developer 原型。

仓库 Settings → Pages 的 Source 需为 **GitHub Actions**。Pages 部署采用 GitHub 官方 [自定义工作流](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)，仅 master 可以发布；PR 只校验构建。

预留 Repository variables：

| 变量 | 默认值 | 用途 |
| --- | --- | --- |
| `WEBSITE_SITE_URL` | `https://www.inhand.com` | 官网构建的域名与 canonical/sitemap |
| `WEBSITE_BASE_URL` | `/docs/` | 官网挂载目录，必须以 `/` 开始和结束 |
| `DEVELOPER_PORTAL_URL` | `https://www.inhand.com/developer` | Hardware、Software 等外部入口 |

官网路径尚未确认，上述默认值只是接口占位，不表示官网入口已经开放。GitHub Pages 只托管 Documentation，不发布完整 ZYB Developer；预览中的外部门户链接仍指向预留地址。后续官网开放时，确认三个变量、配置独立生产凭据，将 dummy 步骤替换为实际部署，并验证文档深链接和 `/pagefind/` 资源。不得将 Pages 的 `/mo-docs/` 构建直接拷贝到官网 `/docs/`；两个目标需各自编译。

## 许可与提交

文档许可见 [LICENSE](LICENSE)，素材来源见 [static/ASSETS.md](static/ASSETS.md)，复用范围见 [ZYB-REUSE.md](ZYB-REUSE.md)。字体来源和许可保存在 `src/css/fonts/`，构建时同时复制到 `build/fonts/`。

沿用 Conventional Commits 和现有提交检查，不在提交信息中写内网地址。GitHub Pages 是自动发布的预览；官网部署暂为 dummy。

默认分支为 `master`，`main` 保留历史但弃用。所有修改从工作分支提交 PR 到 `master`，禁止直接推送、强制推送和删除 master；管理员也没有绕过入口。合并前必须通过以下检查，且分支需基于最新 master：

- `commit-message`：校验 PR 标题和 PR 内提交信息，继续使用 `.github/workflows/commit-message.yml` 与 `scripts/check-commit-msg.sh`。
- `validate-and-build-public`：官网参数的测试、类型检查、构建和浏览器验证。
- `validate-and-build-office-preview`：预览参数的同等检查。

提交标题采用 `<type>(<scope>): <subject>`，scope 可省略；type 为 feat、fix、docs、refactor、sync、ci 或 chore，subject 以小写字母开头、不以句号结尾，标题不超过 72 字符。正文与标题间空一行，并遵守脚本中的行长与内部信息限制。Squash 合并时也需保留合规标题；不能把未经检查的任意文本改成最终提交信息。
