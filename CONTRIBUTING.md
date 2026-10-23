# Contributing

[简体中文](CONTRIBUTING.zh-CN.md)

Use a topic branch and open a PR to `master`. Write contributors can create, update and delete topic branches. An Admin merges after the required content and commit checks pass; an Admin's own PR needs no additional approval. Eligible source branches are deleted automatically after merge. See the [README](README.md) for the exact GitHub rules and release ownership.

## Set up and validate

```sh
nvm use
npm ci
npm test
# developer must have its website dependencies installed
npm run preview -- --port 8051
```

Use an available port. Set `DEVELOPER_DIR` for a non-sibling website checkout.
Use developer's complete build and browser checks for affected routes, media,
search and downloads. This repository's CI validates content and resources.

## Write evidence-based guides

- Put new software guides in the relevant board section. Reuse a partial only when its statements apply to every consuming board, or explicitly scope the differences.
- Record the board, image/build, relevant tool and runtime versions, command, observed result and limits. Distinguish an inspected development installation from a clean image. Do not infer inference correctness from installed packages, operator support or TOPS.
- Test commands in an appropriate environment. Prefer read-only checks and isolated fixtures for account, network, firewall and deployment behavior. Describe recovery and validation boundaries for commands that can interrupt access or reload firmware.
- Keep screenshots factual, use readable terminal text and alt text, and remove credentials or private network details before publication. Mark old evidence as historical when instructions change; do not present an old screenshot as proof of a new command.
- Link maintained model/tool/example sources in their owning repositories. Preserve published downloads and redirects unless a separate migration is agreed. Hardware facts and design files belong under hardware/ in this repository.
- Include third-party licenses, source URLs and hashes beside downloadable artifacts. Verify the extracted payload as well as the archive checksum where a package is published.

Use normal Markdown tables; the shared table component handles layout. Use documentation links for software pages and the hardware mapping for migrated routes. Check mobile and desktop layouts after changing media, tables or navigation. README paragraphs and list items stay on a single source line; the 72-character commit-message rule does not apply to README source wrapping.

## Messages and PRs

```text
docs(mo62a): clarify the measured runtime compatibility

Explain the evidence or user impact when a title is insufficient.
```

A short English Conventional Commit is sufficient. Use the types and limits in [repository-policy.json](config/repository-policy.json); no bilingual Message block is required. Do not add Co-Authored-By, CI-skip directives or private infrastructure details. `npm ci` installs local hooks; CI checks the PR title and every new non-merge commit. `git commit --amend` or interactive rebase can fix unpublished topic history. Never rewrite published Tags.

The PR body should explain the concrete change, validation and unresolved limits. GitHub merge commits are excluded from Changelog entries. With squash, keep the validated title and a conforming optional body, and allow for GitHub's PR-number suffix within the final 72-character title limit. With rebase, the checked topic commits remain the release-note source.

## Content rules and diagrams

Use registered MDX components and content/media imports. Keep frontend logic in
developer. Do not edit generated `validation/` files: update and test the rules
in developer, then export a bundle from a committed revision. The content CI
verifies the bundle hashes before running it.

Edit `scripts/render-architecture.mjs` and run `npm run docs:diagrams` to update
the bilingual SVG diagrams. Review both languages. Keep source/license notices
and migration mappings with moved content; never replace evidence with a claim.

## Release procedure (Admin)

1. Confirm the selected master commit has passed the required checks and integrated website preview.
2. Check `git ls-remote --tags origin`; create an annotated ordinary `VX.Y.Z` tag. Only developer publishes new RCs.
3. Inspect validation, content packaging and Release publication. Verify the archive, file manifest, release metadata and SHA256SUMS against the selected commit.
4. Developer selects this ordinary release in a subsequent frozen website composition. There is no mo-docs deployment step.

Manual dispatch validates/packages without publication. Preserve historical
Tags and published assets. A failed draft is not a complete published release;
inspect its state before retrying. Content corrections use a new ordinary version.
