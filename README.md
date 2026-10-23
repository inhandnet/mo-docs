# Mo documentation

[简体中文](README.zh-CN.md)

Software documentation for the Mo series: prepare a board, install Mo OS, use the system, develop AI and peripheral applications, and select compatible tools, models and examples. This repository builds an independent Docusaurus 3 site with Node.js 22 and publishes it under `/docs/` on the developer platform.

| Environment | Address | Updates |
|---|---|---|
| Test platform | [developer.inhand.online/docs/](https://developer.inhand.online/docs/) | Release candidates and final releases |
| Production target | [developer.inhand.com/docs/](https://developer.inhand.com/docs/) | Final releases; deployment infrastructure and credentials required |
| GitHub Pages preview | [inhandnet.github.io/mo-docs/](https://inhandnet.github.io/mo-docs/) | Integrated `master`; preview banner and no search-engine indexing |

## Inside mo-docs

![Content, components, data and build architecture](architecture/documentation.en.svg)

| Layer | Location | Responsibility |
|---|---|---|
| Guides | `docs/mo-*/`, `docs/security/`, `docs/works-with-mo/` | Board-specific instructions, tested software boundaries and references |
| Shared content | `docs/_partials/` | Reusable MDX; board-specific claims remain scoped to their evidence |
| Navigation and rendering | `sidebars.ts`, `src/components/`, `src/theme/` | Documentation links, tables, image downloads, hardware redirects and search UI |
| Release data | `src/data/generated/releases.json` | Reviewed, committed GitHub Releases snapshot |
| Public assets | `static/img/`, `static/downloads/` | Screenshots, diagrams, licensed media, example sources and evidence |
| Site build | `docusaurus.config.ts`, `plugins/`, `scripts/` | Routes, shared styling, Pagefind index, environment settings and deployment metadata |
| Verification and delivery | `tests/`, `.github/workflows/` | Content, script, release, browser and layout checks; preview and release workflows |

The site uses three distinct integration paths. Ordinary links lead to maintained upstream sources and releases. `npm run fetch-data` explicitly refreshes the local release snapshot; review and commit the result, because a normal build does not refresh it. The Mo62A image download control queries the latest GitHub release in the browser and accepts only a complete stable image/checksum pair; if it cannot resolve one, it links to release history. It never pairs files from different releases.

Hardware material is maintained in **mo-hardware**. The 33 legacy hardware routes remain as redirects with query strings, anchors and a link that works without JavaScript. Existing public download URLs remain available for compatibility. Hardware redirects are excluded from the documentation search index.

## Mo series repository architecture

![Repository ownership and resource integration](architecture/repository-map.en.svg)

| Repository | Owns | How mo-docs uses it |
|---|---|---|
| **developer** · GitLab | Main website, product discovery, navigation, downloads, community and contact pages at `/` | Shared platform navigation and entry points |
| [mo-docs](https://github.com/inhandnet/mo-docs) | Software guides and their evidence at `/docs/` | This repository |
| [mo-hardware](https://github.com/inhandnet/mo-hardware) | Interfaces, schematics, mechanics, accessories and compliance at `/hardware-docs/` | Direct links and compatibility redirects |
| **Mo\*** · Product repositories | Each model's BSP, boot components, kernel, root filesystem, image integration and build/flash tools | Versioned images, SDK integration and source references; for example [Mo62A](https://github.com/inhandnet/Mo62A) |
| [mo-models](https://github.com/inhandnet/mo-models) | Model metadata, `.link` download references, compilation, compatibility and benchmark records | Model selection, provenance and compatible artifacts; model binaries are hosted separately |
| [mo-tools](https://github.com/inhandnet/mo-tools) | Toolchain version pins, host setup and board test utilities | Reproducible development and validation environments |
| [mo-examples](https://github.com/inhandnet/mo-examples) | Runnable AI, camera and application examples | Tutorial source and application-side examples |

`Mo*` represents a separate BSP and image repository for each model in the Mo series. The architecture does not depend on a fixed number of product repositories. The three websites build and deploy independently, with each deployment confined to its own directory. A release in one source repository does not automatically rebuild the websites or release the other repositories.

Each repository has its own version. Document a **tested combination** of image, board revision, SDK, TIDL compiler, target libraries and firmware, model graph/artifacts, tool revision and application configuration. Equal version numbers across repositories are neither required nor sufficient. A development-board observation is not automatically a pristine release-image guarantee; a Mo62A test is not evidence for another model.

## Repository protection

| Operation | Write | Admin |
|---|---|---|
| Create, update or delete a topic branch | Allowed | Allowed |
| Open a PR to `master` | Allowed | Allowed |
| Merge to `master` | Not allowed | After required CI passes |
| Merge one's own PR | Not allowed | Same checks; no second approval required |
| Direct push, force-push or delete `master` | Not allowed | Blocked by the PR/check ruleset |
| Create remote Tags and start releases | Not allowed | Allowed; Tag CI validates after push |

GitHub uses **two rulesets for master and one for all Tags**. Permissions and merge checks are separate because bypass permissions apply to an entire ruleset.

| Ruleset | Scope | Rules / bypass |
|---|---|---|
| `admin-only-master-updates` | `refs/heads/master` | Restricts creation/update/deletion/force-push; only Admin has bypass |
| `master-pr-and-required-checks` | `refs/heads/master` | PR, up-to-date required checks, no deletion or force-push; **no bypass**; required approvals: 0 |
| `admin-only-tags` | All Tags | Restricts creation/update/deletion/force-push; only Admin has bypass |

Required checks are `commit-message`, `validate-and-build-public` and `validate-and-build-office-preview`. Topic branches have no additional ruleset restriction. The repository automatically deletes eligible source branches after PR merge. Merge, squash and rebase remain available; when squashing, use the validated PR title and a conforming optional body, including room for GitHub's PR-number suffix.

Local hooks provide early feedback and can be bypassed locally; CI is the merge gate. Admins who can edit repository settings remain trusted operators. Their Tag-rule bypass also permits administrative changes to Tags: **published Tags and Releases must not be rewritten or deleted** in this workflow. Use a new RC or version for corrections. No local or server-side Tag-creation hook is installed; an invalid Tag remains visible but fails CI before publication.

## English commit messages and Changelog

```text
fix(download): keep the image and checksum on the same release
```

An English Conventional Commit title is sufficient. Add an English body when useful. Types are `feat`, `fix`, `perf`, `docs`, `style`, `refactor`, `test`, `build`, `ci`, `chore`, `revert` and `sync`; the lowercase scope is optional. Keep the title within 72 characters, start the subject with a lowercase letter and omit a final period. Separate a body with a blank line and wrap prose at 72 characters, except URLs and indented code. Do not add credentials, private infrastructure, `Co-Authored-By` or CI-skip markers.

`npm ci` installs this clone's `commit-msg` and `pre-push` hooks, so invalid messages fail at `git commit`, including `git commit -m`. CI checks the PR title and new non-merge commits again. Historical commits before the policy boundary are not rewritten. The policy is in [repository-policy.json](config/repository-policy.json) and [policy.mjs](scripts/lib/policy.mjs).

Release notes use English entries in both editions. Only fixed headings and categories are translated, for example Features / 新功能, Fixes / 修复 and Documentation / 文档. Historical `Message: en` and `Message.en:` summaries remain readable; new commits do not need bilingual blocks. [generate-changelog.mjs](scripts/generate-changelog.mjs) computes the range after the preceding **final** release, so RCs and the final release include the complete change set rather than only changes since the last RC.

### Translation API (planned)

| Platform | Translation server | Status |
|---|---|---|
| GitLab | - | To be integrated |
| GitHub | - | To be integrated |

These are placeholders for future translation of change entries. The current generator runs without a translation API or credentials.

## From a change to a release

![PR checks, preview, release and environment deployment](architecture/release-flow.en.svg)

1. Work on a topic branch and open a PR. CI validates messages, tests, TypeScript and both the public `/docs/` build and root-path preview. Both builds run browser checks and produce downloadable review artifacts.
2. An Admin merges after the required checks pass. GitHub Pages updates from `master`; PRs have build artifacts, not separate Pages deployments. Merging does not deploy the product test or production site.
3. An Admin pushes an annotated `VX.Y.Z-rcN` or `VX.Y.Z` Tag on a reviewed `master` commit. All pushed Tag names reach the release workflow; CI validates the exact version syntax, annotation, mainline ancestry and commit policy.
4. CI builds and tests the test and production destinations separately, packages them with deployment metadata, generates Changelogs and publishes the complete GitHub Release through a draft.
5. Test deployment waits for publication. A final release then deploys to production after the test deployment succeeds. Each job verifies the archive checksum and reads back the live `deployment.json`; missing credentials or a version mismatch fail that job.

| Tag | GitHub Release | Test | Production |
|---|---|---|---|
| `V1.2.3-rc1` | Prerelease | Automatic | Never |
| `V1.2.3` | Final release | Automatic | After test deployment succeeds |

Use uppercase `V`, three numeric components without leading zeros, and optionally lowercase `-rcN` with `N` starting at 1. The Tag defines the site release version; `package.json` and the lockfile describe the build project and must agree with each other. Manual `workflow_dispatch` validates and packages a candidate from `master` ancestry without publishing a Release or deploying.

Artifacts include `mo-docs-VERSION-test.tar.gz`, `mo-docs-VERSION-production.tar.gz`, `release.json`, `CHANGELOG.en.md`, `CHANGELOG.zh-CN.md`, `release-notes.md` and `SHA256SUMS`. The environment suffix prevents deploying a build with the wrong canonical URLs or cross-site navigation. Existing release filenames and Tags remain unchanged.

A published Release can coexist with a failed deployment. Inspect the relevant job and live version before announcing availability. Production deployment requires `OPS_PROD_*` secrets and the server adapter; the current repository configuration has only the test deployment credentials. See [ARCHITECTURE.md](ARCHITECTURE.md) for the adapter contract and environment variables.

## Local development

```bash
nvm use
npm ci
npm start -- --port 8051
```

Choose an unused port when other previews are running. For a built site, use `npx docusaurus serve --host 127.0.0.1 --port 8051 --no-open`.

| Command | Purpose |
|---|---|
| `npm test` | Content, data, governance, release and downloadable-script regressions |
| `npm run typecheck` | TypeScript checks |
| `npm run build` | Build the committed content into `build/`, including Pagefind and deployment metadata |
| `npm run build:test` / `npm run build:production` | Build with the exact destination origin and `/docs/` path |
| `npm run test:browser` | Test the current build using a dynamically allocated local port |
| `npm run fetch-data` | Refresh release metadata explicitly; failure leaves the previous snapshot intact and exits nonzero |
| `node scripts/render-architecture.mjs` | Regenerate the bilingual SVG diagrams from maintained source |

For browser tests, install Chromium once with `npx playwright install chromium` and use the same environment variables as the build. See [CONTRIBUTING.md](CONTRIBUTING.md) for content and verification conventions, [ARCHITECTURE.md](ARCHITECTURE.md) for technical detail and [SECURITY.md](SECURITY.md) for reporting guidance. Repository content is CC BY-SA 4.0; third-party assets retain their notices in [static/ASSETS.md](static/ASSETS.md) and adjacent source files.
