# Contributing to Mo documentation

English | [简体中文](CONTRIBUTING.zh-CN.md)

Contributions should help readers use and develop with Mo series single-board computers. See [README.md](README.md#contributing) for browser-based editing, local preview, checks, and commit message requirements. Submit changes through a pull request to `master`.

## Document structure

Edit the Markdown or MDX files under `docs/`. Product guides live in `docs/<board>/<section>/`; shared topics have their own directories.

Each page should have a clear title, a short description, and a sidebar position:

```yaml
---
title: First boot
description: Boot and sign in to your Mo board.
sidebar_position: 3
---
```

The sidebar is generated from the directory tree. Use `_category_.json` to set category labels and ordering. Category landing pages use `index.mdx` and Docusaurus `DocCardList`.

State the applicable board, hardware revision, and software version. Describe prerequisites, expected results, and any risk of data loss before the relevant steps. Do not claim that instructions, downloads, or specifications have been verified unless they have.

## Shared and incomplete content

Shared MDX components live in `docs/_partials/`. For example:

```mdx
import FlashOsImage from '@site/docs/_partials/getting-started/flash-os-image.mdx';

<FlashOsImage board="mo-62a" />
```

Use `Only` for board-specific passages inside shared content. Check all affected board pages after changing a shared component.

Use `<ComingSoon />` for content that is not yet available. Keep planning priorities and task identifiers out of published pages. Do not create empty downloads or invent missing instructions. Use `draft: true` in front matter for pages that should not be published; static builds exclude these pages, while the development server can display them.

## Links, assets, and data

- Prefer relative file links between documentation pages.
- Use `@site/src/components/DocumentationLink` for JSX links. It resolves documentation paths against the deployment base path and routes other portal sections through `DEVELOPER_PORTAL_URL`.
- Put images in `static/img/`. Link to the actual release or resource location for large images, SDKs, and downloadable documents.
- Documentation illustrations, screenshots, and animated GIFs fill the available body width, matching full-width note boxes rather than using a fixed pixel width. Height follows the original aspect ratio; do not stretch or crop content to force matching heights. Use the global `--mo-doc-media-width` style rather than per-page display sizes. For screenshots inside numbered steps, use a `mo-tool-screenshot` wrapper directly inside the list item to align the image with the body, while keeping the step text indented. Keep source assets at their original resolution. Check still images and animations together in full-screen, split-screen, and mobile previews.
- Keep product facts in `src/data/products.ts`. Check the source and applicable version before changing specifications.
- Release notes use the committed snapshot in `src/data/generated/releases.json`. Run `npm run fetch-data` to refresh it, inspect the result, and commit it explicitly. Builds do not refresh the data automatically. Check repository mappings before fetching; a failed fetch can retain the previous snapshot.
- When adding a board, update its documentation tree, product data, board-selection table, and affected tests.

## Style and review

Write clear, task-oriented English. Keep translations of repository guides in sync. Use the existing styles and bundled fonts, and preserve their license notices.

Before submitting, run the checks described in the README or review the results from GitHub Actions. Check navigation, shared content, download links, search, and narrow-screen layouts. For product instructions, describe what you tested and identify anything that still needs verification.

Do not include private infrastructure details, credentials, or confidential material. Follow [SECURITY.md](SECURITY.md) for security-related concerns. Only contribute material you have the right to share under the applicable license.

For site components and deployment settings, see [ARCHITECTURE.md](ARCHITECTURE.md).
