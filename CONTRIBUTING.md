# Contributing

[简体中文](CONTRIBUTING.zh-CN.md)

Use a topic branch and open a PR to `master`. Write contributors can create, update and delete topic branches. An Admin merges after all three required checks pass; an Admin's own PR needs no additional approval. Eligible source branches are deleted automatically after merge. See the [README](README.md) for the exact GitHub rules and release ownership.

## Set up and validate

```bash
nvm use
npm ci
npm test
npm run typecheck
npm run build
npx playwright install chromium
npm run test:browser
```

Use an unused port for interactive previews. Browser checks allocate their own ports and must run with the same origin/base/portal/hardware variables used for the build. To validate a release destination, use `node scripts/build-site.mjs test --verify` or `node scripts/build-site.mjs production --verify`.

## Write evidence-based guides

- Put new software guides in the relevant board section. Reuse a partial only when its statements apply to every consuming board, or explicitly scope the differences.
- Record the board, image/build, relevant tool and runtime versions, command, observed result and limits. Distinguish an inspected development installation from a clean image. Do not infer inference correctness from installed packages, operator support or TOPS.
- Test commands in an appropriate environment. Prefer read-only checks and isolated fixtures for account, network, firewall and deployment behavior. Describe recovery and validation boundaries for commands that can interrupt access or reload firmware.
- Keep screenshots factual, use readable terminal text and alt text, and remove credentials or private network details before publication. Mark old evidence as historical when instructions change; do not present an old screenshot as proof of a new command.
- Link maintained model/tool/example sources in their owning repositories. Preserve published downloads and redirects unless a separate migration is agreed. Hardware facts and design files belong in mo-hardware.
- Include third-party licenses, source URLs and hashes beside downloadable artifacts. Verify the extracted payload as well as the archive checksum where a package is published.

Use normal Markdown tables; the shared table component handles layout. Use documentation links for software pages and the hardware mapping for migrated routes. Check mobile and desktop layouts after changing media, tables or navigation. README paragraphs and list items stay on a single source line; the 72-character commit-message rule does not apply to README source wrapping.

## Messages and PRs

```text
docs(mo62a): clarify the measured runtime compatibility

Explain the evidence or user impact when a title is insufficient.
```

A short English Conventional Commit is sufficient. Use the types and limits in [repository-policy.json](config/repository-policy.json); no bilingual Message block is required. Do not add Co-Authored-By, CI-skip directives or private infrastructure details. `npm ci` installs local hooks; CI checks the PR title and every new non-merge commit. `git commit --amend` or interactive rebase can fix unpublished topic history. Never rewrite published Tags.

The PR body should explain the concrete change, validation and unresolved limits. GitHub merge commits are excluded from Changelog entries. With squash, keep the validated title and a conforming optional body, and allow for GitHub's PR-number suffix within the final 72-character title limit. With rebase, the checked topic commits remain the release-note source.

## Release snapshots and diagrams

`npm run fetch-data` explicitly refreshes `src/data/generated/releases.json`. Review the complete diff, especially repository identity, stable/candidate selection and dates. A failed fetch retains the old bytes and exits nonzero; an unchanged response does not update the timestamp. Do not edit the snapshot to invent a missing release or assume a ChangeLog path.

Edit `scripts/render-architecture.mjs` and run it to update the bilingual SVG diagrams in `architecture/`. Review both languages at desktop and mobile widths. Do not use raster screenshots as the editable source for architecture diagrams.

## Release procedure (Admin)

1. Confirm the selected master commit has passed the required checks and the intended changes are reviewed. Verify that deployment configuration exists for every destination the Tag will trigger.
2. Check the remote Tag namespace with `git ls-remote --tags origin`, then create and push an annotated `VX.Y.Z-rcN` or `VX.Y.Z` Tag. Tag CI validates after push; there is no local Tag-creation gate.
3. Inspect validation, package, publication and deployment jobs. Download and check `SHA256SUMS` and `release.json`, then confirm the live `deployment.json` matches the Tag's commit.
4. If publication or deployment fails, inspect the actual Release/server state. Do not rewrite an existing Tag or published asset; issue the next RC/version for a content correction.

Manual workflow dispatch validates and packages without publication or deployment. Chinese-heading Changelogs retain English entries and need no translation service. Production readiness requires actual configured infrastructure, not just a successful production build.
