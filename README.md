# mo-docs

Documentation source for the InHand **Mo** series single-board computers
(Mo62A, Mo68A). Content in this repository will be published to the Mo
developer site.

## Commit message convention

Every commit in this repository follows the format below. Pull request titles
use the same format, because pull requests are squash-merged and the title
becomes the commit message.

### Format

```text
<type>(<scope>): <subject>

<body>

<footer>
```

The first line is required. The body and footer are optional, but write a body
whenever the reason for the change is not obvious from the subject.

### Type

The types follow [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/)
and match the practice in the `inhandnet/documents` repository.

| Type | Use it when you |
|---|---|
| `feat` | Add a new page or section, or a new site feature |
| `fix` | Correct an error: wrong command, wrong value, broken link, typo |
| `docs` | Change existing content: new image version, new data, clearer wording |
| `refactor` | Move, rename or restructure pages without changing what they say |
| `sync` | Import content automatically from another repository |
| `ci` | Change CI workflows (link checks, publishing) |
| `chore` | Change anything else that readers do not see: site configuration, README, templates, generated files |

Use one type per commit. If a change needs two types, split it into two
commits. For example, rename a file in a `refactor` commit, then edit it in a
`docs` commit. This keeps the file history readable.

### Scope

The scope is optional. When you use one, name the part of the documentation
that changes, in lowercase letters, digits, `-` and `/`. Recommended scopes:

| Scope | Covers |
|---|---|
| `mo62a` | Pages for Mo62A |
| `mo68a` | Pages for Mo68A |
| `shared` | Content shared by all boards |
| `choose-your-board` | The board selection page |
| `accessories` | Accessory pages |
| `works-with-mo` | Ecosystem partner pages |
| `security` | Security advisories, vulnerability reporting, SBOM pages |

You can narrow a board scope to one section, for example `mo62a/getting-started`.

### Subject

- Use the imperative mood: "add", not "added" or "adds".
- Start with a lowercase letter. Do not end with a period.
- Keep the whole first line to 72 characters or fewer.
- Say what changes, not how. Product names keep their own spelling (`Mo62A`, `TIDL`).

### Body

- Explain **why** the change is needed. The diff already shows what changed.
- Wrap lines at 72 characters.
- If the content depends on a specific image version, state it, for example
  `Applies to image V1.1.0`.

### Footer

| Trailer | Use |
|---|---|
| `Fixes: #<issue>` | The commit resolves an issue |
| `Refs: #<issue>` | The commit relates to an issue but does not resolve it |
| `Co-authored-by: Name <email>` | More than one person wrote the change |
| `BREAKING CHANGE: <description>` | A page URL changes or a page is removed, so external links break. Add a redirect in the same pull request |

A `!` after the type or scope, as in `refactor(mo62a)!: ...`, also marks a
breaking change. Use it together with the `BREAKING CHANGE` trailer, which
explains what breaks.

### Examples

```text
feat(mo62a/getting-started): add first NPU demo walkthrough
```

```text
fix(shared): correct calibration_frames default in TIDL compile guide

The guide said the default is 8. The tool uses 20, and feeding fewer
frames than configured makes the compiler skip writing artifacts
without an error.

Applies to image V1.1.0
Fixes: #12
```

```text
refactor(mo62a): rename quickstart.md to getting-started.md

BREAKING CHANGE: /mo62a/quickstart is now /mo62a/getting-started.
A redirect from the old path is included.
```

```text
docs: update image version to V1.1.0 on all download pages
```

Automated commits may end with `[skip ci]`, for example
`chore: regenerate llms.txt [skip ci]`. The check ignores that suffix.

### Not allowed

- Messages such as `update`, `fix typo`, `wip` or `misc` with no type.
- Several unrelated changes in one commit.
- Internal information in any part of the message: internal host names, IP
  addresses, ticket links that customers cannot open, or customer names.

## Automated checks

`scripts/check-commit-msg.sh` holds the rules above. The git hooks and the CI
workflow all call it, so the rules exist in one place.

| Check | When it runs | What it rejects |
|---|---|---|
| `.githooks/commit-msg` | `git commit` | A commit whose message breaks the convention |
| `.githooks/pre-push` | `git push` | A push that contains such a commit, or an unsquashed `fixup!` / `squash!` commit |
| `.github/workflows/commit-message.yml` | Every pull request and every push to `main` | The same, plus a pull request title that breaks the convention |

The script checks:

- the first line format and the type; the scope format when present;
- the subject starts with a lowercase letter and has no final period;
- the first line is 72 characters or fewer;
- a blank second line before the body;
- body lines are 72 characters or fewer (URLs and indented code are exempt);
- no private IP address or internal domain anywhere in the message.

### Enable the local hooks

Run this once after you clone the repository:

```sh
git config core.hooksPath .githooks
```

Check the commits on your branch by hand:

```sh
scripts/check-commit-msg.sh --revs origin/main..HEAD
```

The local hooks help you find a problem before you push. They do not enforce
the rules, because anyone can skip them with `git commit --no-verify`.

### Enforcement on GitHub

The CI check enforces the rules. A repository administrator sets this up once,
in **Settings › Rules › Rulesets**, with a branch ruleset for `main`:

1. **Require a pull request before merging.** Nobody can push to `main`
   directly, so every change goes through the CI check.
2. **Require status checks to pass**, and add the check `commit-message`.
3. **Block force pushes.**
4. In **Settings › General › Pull Requests**, allow **squash merging** only.

With these settings, a pull request that breaks the convention cannot be
merged.

On a GitHub Enterprise plan, the ruleset rule **Restrict commit metadata**
can also reject a non-conforming push on the server. Other plans do not
offer this rule, so this repository relies on the CI check.

## License

The documentation in this repository is licensed under the
[Creative Commons Attribution-ShareAlike 4.0 International License](https://creativecommons.org/licenses/by-sa/4.0/)
(CC BY-SA 4.0). See [`LICENSE`](LICENSE).

Material quoted from third parties, such as diagrams or tables from vendor
documentation, keeps its original license. Each such item names its source
and license where it appears.
