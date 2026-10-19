# 参与 Mo 文档贡献

[English](CONTRIBUTING.md) | 简体中文

贡献内容应帮助读者使用 Mo 系列单板计算机并进行开发。网页编辑、本地预览、检查命令和提交信息规范见 [README.zh-CN.md](README.zh-CN.md#参与贡献)。所有修改通过 PR 提交到 `master`。

## 文档结构

编辑 `docs/` 中的 Markdown 或 MDX 文件。产品指南位于 `docs/<board>/<section>/`，通用主题使用独立目录。

每个页面应包含清晰的标题、简短描述及侧栏顺序：

```yaml
---
title: First boot
description: Boot and sign in to your Mo board.
sidebar_position: 3
---
```

侧栏根据目录树自动生成。使用 `_category_.json` 设置分类名称和顺序；分类首页使用 `index.mdx` 和 Docusaurus 的 `DocCardList`。

说明适用的板卡、硬件修订和软件版本。在操作步骤之前列出前置条件、预期结果及可能的数据丢失风险。未经验证，不要声称操作、下载或规格已经验证通过。

## 共享内容与待完善内容

共享 MDX 组件位于 `docs/_partials/`。例如：

```mdx
import FlashOsImage from '@site/docs/_partials/getting-started/flash-os-image.mdx';

<FlashOsImage board="mo-62a" />
```

在共享内容中使用 `Only` 区分板卡适用段落。修改共享组件后，检查所有受影响的板卡页面。

尚未提供的内容使用 `<ComingSoon />`，不要在公开页面显示内部优先级和任务编号。不要创建空下载文件或编造缺失步骤。不应发布的页面可在 front matter 中设置 `draft: true`；静态构建不包含这些页面，开发服务器可显示它们。

## 链接、素材和数据

- 文档页面之间优先使用相对文件链接。
- JSX 链接使用 `@site/src/components/DocumentationLink`，以适配部署路径；其他门户栏目通过 `DEVELOPER_PORTAL_URL` 跳转。
- 图片放在 `static/img/`。大型镜像、SDK 和下载文档链接到实际发布或资源位置。
- 文档正文的插图、截图和 GIF 动图统一铺满正文可用宽度，与通栏 NOTE 提示框对齐，不再限定固定像素宽度。高度保持原始比例，不为统一高度而拉伸或裁切内容。统一使用全站 `--mo-doc-media-width` 样式，不在各页单独设置展示尺寸。编号步骤中的截图使用直接放在列表项内的 `mo-tool-screenshot` 容器，让图片与正文边缘对齐，同时保留步骤文字的缩进。源素材保留原始分辨率；全屏、分屏和手机预览时同时检查静态图与动图。
- 产品信息保存在 `src/data/products.ts`。修改规格前核对来源和适用版本。
- 发布记录使用已提交的 `src/data/generated/releases.json` 快照。运行 `npm run fetch-data` 刷新后，检查结果并单独提交；构建不会自动刷新数据。获取前应检查仓库映射，获取失败时可能继续保留旧快照。
- 新增板卡时，同步更新文档目录、产品数据、选板表格及受影响的测试。

## 风格与检查

文档正文使用清晰、面向具体操作的英文。仓库指南的翻译保持同步。沿用已有样式和内置字体，并保留许可证声明。

提交前运行 README 中的检查，或查看 GitHub Actions 的检查结果。检查导航、共享内容、下载链接、搜索和窄屏布局。产品操作说明应列出实际测试内容，并标明仍待验证的部分。

不要提交内部基础设施信息、凭据或机密内容。安全相关问题遵循 [SECURITY.md](SECURITY.md)。请仅提交有权按照相应许可证分享的内容。

站点组件和部署配置见 [ARCHITECTURE.md](ARCHITECTURE.md)。
