# Contributing to mo-docs

Thank you for helping improve the Mo documentation. This repository holds
documentation only. Questions about using a board belong in the
[community forum](https://community.inhand.com), and security
vulnerabilities are reported as described in [SECURITY.md](SECURITY.md).

## Report a problem

Every page on the site has two buttons next to the title:

- **Edit this page** opens the source file on GitHub, where you can propose
  a change in a pull request.
- **Report an issue** opens the documentation error form with the page
  already filled in.

You can also open the form directly from the
[Issues](https://github.com/inhandnet/mo-docs/issues/new/choose) tab.

## Propose a change

1. Fork the repository and create a branch.
2. Make your change and preview it locally. See
   [Local preview](README.md#local-preview).
3. Run `mkdocs build --strict` and fix any warning.
4. Open a pull request. Write the title in the commit message format,
   because pull requests are squash-merged and the title becomes the commit
   message. See [Commit message convention](README.md#commit-message-convention).

Small fixes, such as a typo or a broken link, can go straight to a pull
request. For a new page or a change to the structure, open an issue first
so that we can agree on where the content goes.

## Writing rules

- Write in English.
- State the image version that a page applies to, for example
  `Applies to image V1.1.0`.
- Name files and directories in lowercase letters, digits and `-`. Do not
  use spaces.
- When you add a page, add it to `nav` in `mkdocs.yml`.
- Put images next to the page that uses them, in an `images/` directory.
- When the same content applies to more than one board, write it once in
  `snippets/` and include it with `--8<-- "file.md"`.
- Do not include internal information: internal host names, private IP
  addresses, local paths from your computer, or customer names.
- Material quoted from third parties keeps its original license. Name the
  source and the license where it appears.

## License

By contributing, you agree that your contribution is licensed under the
[CC BY-SA 4.0](LICENSE) license of this repository.
