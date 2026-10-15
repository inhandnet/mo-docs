# Documentation site architecture

The Mo documentation website is built with Docusaurus and MDX. The repository contains documentation, reusable content components, and the configuration needed to build a static website.

## Source layout

| Path | Purpose |
| --- | --- |
| `docs/` | Documentation pages and category metadata |
| `docs/_partials/` | Shared MDX content |
| `sidebars.ts` | Automatically generated documentation navigation |
| `src/components/` | Documentation blocks, specifications, and link handling |
| `src/data/` | Product information and release data |
| `src/theme/` | MDX registration, search, and search-index metadata |
| `src/css/` | Site styles and bundled fonts |
| `static/` | Files copied into the published site |
| `plugins/` | Search indexing, font notices, and build-cache configuration |
| `tests/` | Content, browser, and visual-style checks |

## Build and search

Docusaurus renders the documentation and resolves internal links during the build. Invalid documentation links fail the build. Category pages and navigation use the documentation directory tree.

Pagefind indexes the generated HTML and provides full-text search with board filters. Search requires a static build; it is not available in the development server. The font plugin copies the bundled fonts' license and source notices into the published site.

Release notes read a committed JSON snapshot. `npm run fetch-data` updates that snapshot explicitly; it is not a build step. Product specifications and release information still require source verification independently of a successful site build.

## Deployment configuration

| Environment variable | Purpose | Default |
| --- | --- | --- |
| `DOCS_SITE_URL` | Site origin for generated metadata | `https://www.inhand.com` |
| `DOCS_BASE_URL` | Mount path, starting and ending with `/` | `/` |
| `DOCS_PREVIEW` | Set to `1` for the preview banner and noindex; disables the sitemap | Unset |
| `DEVELOPER_PORTAL_URL` | Destination for other Developer portal sections | `https://www.inhand.com/developer` |

Documentation links are resolved against the site base path. Links to Hardware, Software, and other portal sections use the portal URL. Build separately for each deployment path, and use the same settings for browser tests. The noindex directive is not access control.

## Continuous integration and publication

- `build.yml` checks pull requests and builds the website variants. Repository variables `WEBSITE_SITE_URL`, `WEBSITE_BASE_URL`, and `DEVELOPER_PORTAL_URL` configure the website target.
- `commit-message.yml` validates pull request titles and commit messages.
- `pages-preview.yml` builds and publishes GitHub Pages from `master`, using the origin and base path supplied by Pages.
- `website-deploy-dummy` reserves the separate website deployment interface. It records the target and artifact without connecting to or deploying to that server.

The Pages preview and website artifacts are separate builds. Replacing the website deployment placeholder requires confirmed hosting settings and credentials. Pull requests do not publish to either target.
