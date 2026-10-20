# Mo documentation

English | [简体中文](README.zh-CN.md)

`mo-docs` is the documentation repository for InHand's Mo series of single-board computers. It provides guides and reference material for setting up a board, configuring its operating system, developing applications, and working with hardware interfaces.

[Read the documentation](https://inhandnet.github.io/mo-docs/) · [Report a documentation issue](https://github.com/inhandnet/mo-docs/issues/new/choose) · [License: CC BY-SA 4.0](LICENSE)

## Using the documentation

Visit the [documentation website](https://inhandnet.github.io/mo-docs/), select your board, and start with **Getting started**. Browse the other sections for system configuration, hardware reference, development guides, and links to releases and downloads. Check the board and software version requirements on each page before following its instructions.

The website is currently a preview. Pages marked **Coming soon** are not yet available.

The Markdown and MDX source files are in [`docs/`](docs/). This repository maintains the documentation and its website source; software images and other downloadable resources are linked from the relevant guides.

## Contributing

Corrections, examples, and new documentation are welcome.

1. Fork the repository, or create a working branch if you have write access. Start from the latest `master`.
2. Edit or add the relevant files in `docs/`. Keep changes focused and identify the applicable boards and software versions.
3. Review your changes. GitHub runs checks on your pull request; you can also preview and test locally using the commands below.
4. Commit using the [commit message convention](#commit-message-convention).
5. Open a pull request targeting `master`. Explain what changed and how you verified it.

If you are reporting a problem rather than proposing a change, [open a documentation issue](https://github.com/inhandnet/mo-docs/issues/new/choose). Include the page URL, relevant board and software version, and a description of the problem. Do not include credentials or other sensitive information in public issues; see [SECURITY.md](SECURITY.md) for security-related reports.

Only contribute material you have the right to share under the applicable license. When changing this README, keep [the Chinese version](README.zh-CN.md) in sync.

See [CONTRIBUTING.md](CONTRIBUTING.md) for document structure, shared content, and review guidance.

### Edit and build on GitHub

You do not need to clone the repository to contribute. Create a working branch or fork on GitHub, open the file you want to change, and use the pencil button to edit it. For Markdown files such as this README, the **Preview** tab shows the rendered text before you commit.

Commit to your working branch using the convention below, then open a pull request to `master`. GitHub Actions automatically runs the checks and builds the documentation. After the pull request is merged, it publishes the updated documentation website.

GitHub's Markdown preview does not render the full documentation website or its MDX components. Pull requests currently receive build and browser checks, but do not have separate live preview URLs.

### Preview locally (optional)

Install Node.js 24, as specified in [`.nvmrc`](.nvmrc), then run:

```bash
git clone https://github.com/inhandnet/mo-docs.git
cd mo-docs
npm ci
npm start
```

Open http://localhost:8041. The development server reloads when source files change.

To preview the built site, including full-text search:

```bash
npm run build
npm run serve
```

Open http://localhost:8040. Full-text search is generated during the build and is not available in the development server.

### Run checks

```bash
npm run check
npx playwright install --with-deps chromium
npm run test:browser
```

`npm run check` runs the documentation tests, TypeScript checks, and static-site build. The browser tests verify navigation, search, and responsive layouts against that build. The Playwright installation command is needed before running browser tests for the first time.

### Commit message convention

Commit messages and pull request titles use this format:

```text
<type>(<scope>): <subject>
```

- Allowed types: `feat`, `fix`, `docs`, `refactor`, `sync`, `ci`, and `chore`.
- The scope is optional. When present, use lowercase letters, digits, and hyphens; use `/` to separate scope segments.
- Start the subject with a lowercase letter and do not end it with a period.
- Keep the complete title within 72 characters.
- If a body is needed, separate it from the title with a blank line. Wrap body lines at 72 characters; URLs and indented code are exempt.
- Do not include private IP addresses, internal-only domains, or sensitive information.
- Add a final bilingual block so versioned releases can generate accurate English and Chinese changelogs:

  ```text
  Message:
    en: Describe the user-visible change in English.
    zh: 用中文描述用户可见的变更。
  ```

Examples:

```text
docs: clarify the first-boot instructions

Message:
  en: Clarify the first-boot instructions.
  zh: 完善首次启动说明。
```

The rules are enforced by [the commit-message workflow](.github/workflows/commit-message.yml) using [`scripts/check-commit-msg.sh`](scripts/check-commit-msg.sh). The pull request title, pull request body and every commit are checked. Put the same final `Message` block in the pull request body so a squash merge preserves it in the commit on `master`.

### Enforcement on GitHub

`master` is the default branch and accepts changes through pull requests only. Before merging, the branch must be up to date with `master` and these checks must pass:

- `commit-message`
- `validate-and-build-public`
- `validate-and-build-office-preview`

Direct pushes, force pushes, and deletion of `master` are blocked. Changes merged into `master` automatically trigger the documentation build and website publication.

### Versioned releases

The continuous deployment from `master` and versioned releases are separate. Merging a pull request keeps publishing the current website. Pushing an annotated tag that exactly matches `V<major>.<minor>.<patch>` runs the full checks, builds the public static site, and publishes a GitHub Release containing the site archive, release metadata, English and Chinese changelogs generated from the validated Git messages, and SHA-256 checksums.

The version without the leading `V` must match both `package.json` and `package-lock.json`. Update those files through a reviewed pull request before creating a release tag. Create the tag only from a commit already contained in `master`:

```bash
git switch master
git pull --ff-only
git tag -a V1.0.0 -m "V1.0.0"
git push origin V1.0.0
```

Replace `V1.0.0` with the version declared by the repository. A lightweight tag, a lowercase `v`, a prerelease suffix, a version mismatch, or a tag whose commit is not in `master` is rejected. Maintainers can run the release workflow manually to build and validate a candidate; manual runs do not publish a GitHub Release.

## License

The documentation is licensed under **Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)**. See [LICENSE](LICENSE) for the full terms.

Third-party components and assets retain their applicable licenses and notices. Bundled Roboto fonts are covered by the [SIL Open Font License 1.1](src/css/fonts/OFL.txt). The documentation license does not grant rights to InHand trademarks or logos.
