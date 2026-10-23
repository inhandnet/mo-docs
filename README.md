# Mo documentation

[简体中文](README.zh-CN.md)

Software and hardware documentation sources for the Mo series. This repository maintains guides, specifications, media, design files, evidence and authoring metadata. The single Docusaurus website, standard components, search, previews and deployment are maintained in **developer**.

The unified website serves documentation at `/docs/` and preserves `/hardware-docs/` and existing attachment URLs. The test platform is [developer.inhand.online](https://developer.inhand.online/); the production target is [developer.inhand.com](https://developer.inhand.com/), subject to infrastructure and release acceptance. Historical GitHub Pages deployments and release tags remain migration references; new mo-docs releases contain content and do not deploy a website.

## Inside mo-docs

![Content sources and the unified website](architecture/documentation.en.svg)

| Location | Maintained content |
|---|---|
| `docs/` | Software guides, FAQ, board sections, shared Markdown/MDX and category metadata |
| `static/` | Screenshots, licensed media, evidence and compatibility downloads |
| `hardware/products/`, `hardware/accessories/` | Hardware specifications, interfaces, schematics, mechanical files and accessories |
| `hardware/training/`, `hardware/templates/` | Maintenance training and author templates; excluded from product navigation |
| `content/hardware-map.json` | Hardware source-to-document route and public asset mapping |
| `content/asset-aliases.json` | Legacy media/download paths generated from one maintained file |
| `content/hardware-migration.json` | Original hardware repository, commit, paths and migration hashes |
| `validation/` | Generated copy of a fixed developer content contract, with commit and hashes |
| `scripts/`, `tests/`, `.github/` | Content and resource validation, repository governance and content releases |

Write normal Markdown. Use registered components for tabs, media, downloads and version tables; component implementation belongs in developer. Shared content and media imports are allowed. Hooks, network requests, arbitrary JavaScript, inline styles and imports from developer's internal `src/` are rejected by the content contract. Teaching code inside fenced code blocks is unaffected. Excel remains a source document or attachment; new structured web data uses JSON.

Hardware material was migrated from mo-hardware. Identical files have one maintained source; the website generates compatibility asset paths. Training and source/license evidence remain in the repository. The hardware map replaces the old software-page redirect stubs during the unified build.

## Mo series repository architecture

![Repository ownership and unified rendering](architecture/repository-map.en.svg)

| Repository | Owns |
|---|---|
| **developer** | Website implementation, standard components, source adapters, contracts, search, preview and complete-site deployment |
| **mo-docs** | Software/hardware documentation, product facts, media, design files and source/license notices |
| **Mo*** | Each model's BSP, image build, system integration and release metadata |
| **mo-tools** | Verified TI toolchain/SDK combinations, host scripts, minimal toolchain examples and Studio |
| **mo-models** | Model catalog, compilation resources, compatibility, raw benchmarks and artifact status |
| **mo-examples** | Complete applications, dependencies, configuration, verification and release packages |

Repositories publish independently. Only developer has RC and final website channels. Each developer release freezes a composition of its own source and selected ordinary subrepository releases. A final website inherits an explicitly accepted RC combination. Website components consume that fixed data; readers do not silently switch to a newer upstream release. Tutorial applicability and actual verification status remain separate from the website version.

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

Required checks are `commit-message` and `validate-content`. Topic branches have no additional ruleset restriction. The repository automatically deletes eligible source branches after PR merge. Merge, squash and rebase remain available; when squashing, use the validated PR title and a conforming optional body, including room for GitHub's PR-number suffix.

Local hooks provide early feedback and can be bypassed locally; CI is the merge gate. Admins who can edit repository settings remain trusted operators. Their Tag-rule bypass also permits administrative changes to Tags: **published Tags and Releases must not be rewritten or deleted** in this workflow. Use a new ordinary version for corrections. No local or server-side Tag-creation hook is installed; an invalid Tag remains visible but fails CI before publication.

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

![Content publication and website composition](architecture/release-flow.en.svg)

1. Edit the owning source and open a PR. Content rules, downloadable-resource tests and commit policy must pass.
2. An Admin merges after required CI. Use developer's integrated preview to check affected pages and links; mo-docs has no independent website build.
3. Check remote Tag availability, then create an annotated `VX.Y.Z` Tag on an accepted master commit. New RC Tags are rejected; historical RCs remain unchanged.
4. CI validates and packages a content archive, file hashes, release metadata and bilingual-heading Changelogs, then publishes a complete ordinary GitHub Release through a draft.
5. Developer selects that release in a subsequent website composition, builds and validates the complete site, then owns its release and deployment.

Assets are `mo-docs-VERSION-content.tar.gz`, `content-manifest.json`, `release.json`, `CHANGELOG.en.md`, `CHANGELOG.zh-CN.md`, `release-notes.md` and `SHA256SUMS`. They contain no site build or deploy credentials. Manual dispatch validates/packages without publication. Published Tags and assets are immutable; inspect failed draft publication before retrying and never overwrite a completed release.

## Local authoring

```sh
nvm use
npm ci
npm test
# Install dependencies once in a sibling developer checkout, then:
npm run preview -- --port 8051
```

Set `DEVELOPER_DIR` if the website checkout is elsewhere. Preview runs developer with this mo-docs directory as a local source override and refreshes edited content. Full website builds, browser checks and search indexing run in developer. `npm run docs:diagrams` regenerates the bilingual README diagrams.

See [CONTRIBUTING.md](CONTRIBUTING.md), [ARCHITECTURE.md](ARCHITECTURE.md) and [SECURITY.md](SECURITY.md). Content is CC BY-SA 4.0; third-party notices remain in [static/ASSETS.md](static/ASSETS.md) and beside their source files.
