# Documentation architecture

[README](README.md) describes repository ownership and the contributor workflow. This document describes the implementation and deployment contracts.

## Content and route ownership

Docusaurus serves `docs/` at the site base path (`routeBasePath: '/'`). Board sections live under `docs/mo-*/`; category JSON and `sidebars.ts` define navigation. Shared MDX under `docs/_partials/` is imported by board pages, not published as independent routes. Keep model-specific evidence scoped to the inspected image and hardware. Place repository-maintenance diagrams in root `architecture/`, outside the public document tree; `scripts/render-architecture.mjs` generates both languages.

`src/components/DocumentationLink` distinguishes documentation routes, main-site routes and hardware routes. `src/data/hardware-routes.json` maps 33 migrated pages to mo-hardware. `HardwareRedirect` retains query strings and fragments, uses `location.replace`, and renders a normal link for no-JavaScript access. Legacy anchors remain in the source pages. Their sidebar children link directly to the hardware site; category landing pages redirect. They are omitted from Pagefind and the sitemap.

Tables use `DocumentationTable` and shared CSS to preserve whole words and provide local scrolling where needed. Media scales within the document column. Image source files remain under `static/`; screenshots and downloadable evidence must retain their provenance and validation boundaries. A diagram explaining architecture is different from a screenshot proving observed behavior.

## Data paths

| Path | Update mechanism | Failure behavior |
|---|---|---|
| Guide content and direct upstream links | Reviewed source edit | Broken local links or anchors fail the build; external targets need separate verification |
| `src/data/generated/releases.json` | Explicit `npm run fetch-data` | Paginated requests with a timeout; failure exits nonzero and preserves the previous file; first refresh never writes partial data |
| Mo62A image download controls | Browser request through `ImageReleaseProvider` | Require one stable release with exactly one uploaded image and one SHA256SUMS asset, matching URLs and nonempty sizes; otherwise offer release history |
| Hardware navigation | Static migration map plus `HARDWARE_URL` | Normal anchor remains usable without JavaScript |

The snapshot includes release publication dates, notes and assets. It is not a manifest of the board's installed software. It has no fallback to an assumed `ChangeLog.md` path. Successful refreshes replace the whole file atomically; unchanged content preserves `generatedAt`. Recommended stable versions are selected numerically, independently of API order or RC labels. Normal builds use committed data and do not contact GitHub for updates.

`src/data/products.ts` contains only documentation resource identities. Product marketing and detailed hardware specifications belong to developer and mo-hardware. The shared version table is still used by shared toolchain content and the Mo68A version-map page; it must not invent unverified versions. Mo62A's detailed version map distinguishes the image build date, Release publication date and development-board observations.

## Build and search

`npm run build` runs Docusaurus, Pagefind via the search plugin, font-license handling and deployment metadata generation. `plugins/build-cache.mjs` invalidates configuration-dependent output; do not reuse a test build for production. Search has product filters and a stale-query guard so a slower earlier request cannot overwrite newer results. The committed fonts are local assets with adjacent source and OFL notices.

| Variable | Local default | Purpose |
|---|---|---|
| `DOCS_SITE_URL` | `https://developer.inhand.com` | Canonical origin |
| `DOCS_BASE_URL` | `/` | Path prefix, starting and ending with `/` |
| `DEVELOPER_PORTAL_URL` | `https://developer.inhand.com` | Main-site navigation origin/path |
| `HARDWARE_URL` | `https://developer.inhand.com/hardware-docs` | Independent hardware-site root |
| `DOCS_PREVIEW` | Off | `1` enables the preview banner and noindex, and disables the sitemap |
| `DOCS_VERSION` | `development` | Site release version in deployment metadata |
| `SITE_ENVIRONMENT` | `local` | Environment in deployment metadata |

`scripts/lib/site-targets.mjs` defines fixed release destinations: test `https://developer.inhand.online/docs/` and production `https://developer.inhand.com/docs/`. `scripts/build-site.mjs` supplies matching portal/hardware URLs and optionally runs browser tests with `--verify`. For custom local or Pages builds, set the variables explicitly. A local uncommitted build's marker names the current HEAD, not a hash of uncommitted edits; only clean CI release builds are immutable release evidence.

## CI and permissions

- `commit-message.yml`: PR opened/edited/synchronized/reopened events check the title and new non-merge commits. Pushes to master check new commits. Event text is parsed from JSON, never inserted into shell source.
- `build.yml`: required `validate-and-build-public` and `validate-and-build-office-preview` jobs run tests, type checks, builds and browser tests. The public review build uses `/docs/`; the preview uses `/`. Artifacts are retained for 14 days.
- `pages-preview.yml`: a master push or manual master run builds with the URL returned by GitHub Pages and the independent hardware Pages URL. It publishes the integrated preview, not a per-PR deployment.
- `release.yml`: all pushed Tags are validated. Manual dispatch runs the validation/package path only. Annotated release Tags must resolve to a commit in `origin/master`; the version is independent of the npm project version, while package/lock metadata must agree.

The three rulesets and required check names are specified in the README. Never merge permission and CI rules into a single Admin-bypass ruleset. Local `npm ci` installs hooks; CI checks remain required even if a local hook is disabled. The policy legacy boundary and the initial Changelog baseline serve different purposes: the former exempts existing history from new message rules; `release-notes/changelog-baseline` bounds the first generated release log. Neither permits rewriting old commits or Tags.

## Release artifacts

Each environment is built and browser-tested separately. `package-site.mjs` checks the build marker before archiving, and `package-release.mjs` verifies both embedded markers before generating release notes and checksums. The tar root contains `index.html` and `deployment.json`.

| File | Contents |
|---|---|
| `mo-docs-VERSION-test.tar.gz` | Site with test canonical/portal/hardware URLs |
| `mo-docs-VERSION-production.tar.gz` | Site with production URLs |
| `release.json` | Version, source commit/date and environment archive URLs |
| `CHANGELOG.en.md`, `CHANGELOG.zh-CN.md` | English entries under English or fixed Chinese headings |
| `release-notes.md` | Combined GitHub Release body |
| `SHA256SUMS` | Checksums for every listed release artifact |

Release publication creates a draft with all assets, then publishes it. Test deployment depends on publication; production also depends on successful test deployment and only runs for final versions. A failure can leave a draft or an already published Release; inspect state before retrying. Do not overwrite existing published assets. A correction gets a new version or RC.

## Deployment adapter

The CI client `.github/scripts/deploy-site.sh` verifies configured credentials, the selected archive's checksum, its root index and its embedded version/commit/environment. It streams the tarball over SSH with a pinned host key to the restricted command `deploy-docs`. The server adapter owns safe extraction, atomic directory switching and rollback. It must confine writes to `/docs/`, preserve the main site and `/hardware-docs/`, and reject unsafe archive paths. This repository does not install that server adapter.

| Test secret | Production secret | Meaning |
|---|---|---|
| `OPS_DEPLOY_HOST` | `OPS_PROD_HOST` | SSH destination |
| `OPS_DEPLOY_USER` | `OPS_PROD_USER` | Restricted deployment account |
| `OPS_DEPLOY_SSH_KEY` | `OPS_PROD_SSH_KEY` | Private key supplied at runtime |
| `OPS_DEPLOY_HOST_KEY` | `OPS_PROD_HOST_KEY` | Verified known_hosts line |

Missing configuration fails, rather than reporting a skipped deployment as success. After SSH completes, CI downloads the destination's `deployment.json` and checks version, source SHA, environment and URLs against the archive. A mismatch fails the job; it does not automatically roll back a potentially newer concurrent deployment. Operators inspect the server's release directories and restore a previously verified archive when appropriate.

Archive-root checks read the entire tar listing before a shell `case` match. Do not replace this with `tar | grep -q` or `printf | grep -q`: early pipe closure under `pipefail` caused the previous rc5 deployment failure. Existing Tags and Release assets remain untouched by new packaging conventions.

Production infrastructure and `OPS_PROD_*` configuration are not established by a successful local build. Local tests can verify the protocol and failure behavior with command stubs; only a real deployment and online marker check establish that a destination is live.
