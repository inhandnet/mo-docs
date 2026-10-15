# 文档维护

优先直接复用 ZYB 已有内容、组件和 Docusaurus 原生能力。只在实际需要时调整内容、路径和配置。

## 修改和新增文档

直接编辑 `docs/<产品>/<栏目>/<文章>.mdx`，例如 `docs/mo-62a/getting-started/install-os.mdx`。Mo68A 的同类文章在自己的产品目录中。

```yaml
---
title: First boot
description: Boot and sign in to your Mo board.
sidebar_position: 3
---
```

目录页沿用原型的 `index.mdx` 和 `DocCardList`；分类名称、顺序和折叠状态写在 `_category_.json` 中。侧栏自动从目录生成。不要额外编写 React 产品导航或维护生成出来的 Markdown。

尚未写完的页面沿用原型组件：

```mdx
<ComingSoon priority="P0" />
```

尚未上传的下载文件保留待补说明，不制造空文件或无效下载地址。需要完全隐藏的草稿使用 Docusaurus 原生 `draft: true`，不要继续使用旧模型的 `status: draft`；静态生产构建（包括办公室预览构建）均不包含此类原生草稿，开发服务器可用于编写。

## 共享内容

沿用 `docs/_partials/` 中的 MDX 组件：

```mdx
import FlashOsImage from '@site/docs/_partials/getting-started/flash-os-image.mdx';

<FlashOsImage board="mo-62a" />
```

用原型的 `Only` 区分板卡适用内容，新增型号前核验适用范围。共享内容修改后检查两款板卡页面。

## 链接、图片和数据

同产品 Markdown 文章优先使用相对文件链接。文档内 JSX 链接使用 `@site/src/components/DocumentationLink`：它将原型的 /docs 路径适配为当前文档根路径，并将 Hardware、Software、Contact 等路径转到 `DEVELOPER_PORTAL_URL`。Markdown 链接通过相同适配器渲染。不要把办公室 IP 写入正文。

图片放在 `static/img/`。大型镜像、PDF 和 SDK 继续链接到真实资源，不提交虚构占位资产。

`src/data/products.ts`、`src/data/generated/releases.json` 和 DocBlocks 的版本表均沿用 ZYB 原型，后续修改时同步核对来源。发布记录刷新使用 `npm run fetch-data`，不把旧快照称为本次实时获取的版本。

首页选型表位于 `src/components/ChooseYourBoard/index.mdx`，其余首页内容位于 `docs/index.mdx`。新增 Mo 产品时补充该表和产品目录。核心板不属于本仓库。

## 视觉和验收

样式以 ZYB `src/css/custom.css` 为基线。Roboto、字号、字重、自然换行和左对齐沿用原型，不引入新的字体。已有字体来源和 OFL 许可在 `src/css/fonts/`。

执行 `npm run check`，再按实际构建参数运行 `npm run test:browser`。检查目录卡片、共享内容、移动端、搜索和链接。发布前另行核验产品操作、版本、下载文件和安全渠道；页面存在不代表内容已验收。
