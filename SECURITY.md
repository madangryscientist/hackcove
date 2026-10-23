# Security policy

## Reporting a vulnerability

Please do not open a public issue or pull request for a security problem.

Report it privately with GitHub's private vulnerability reporting: on this repository, go to
**Security → Report a vulnerability**.

Include the package and version (`@hackcove/ui`, `@hackcove/theme-…`), what you found, and the
smallest steps or markup that reproduce it. You will get an acknowledgement within a week. A fix is
released as a patch version of the affected package, and the report is credited unless you would
rather it was not.

## What is in scope

- `@hackcove/ui`: for example, a component that lets untrusted text become HTML or script (the
  `Markdown` renderer is built not to), or a `colourSchemeScript` that can be abused.
- The published tarballs of `@hackcove/ui` and the `@hackcove/theme-*` packages.
- The release workflow in `.github/workflows/publish.yml`.

The themes are plain CSS and ship no runtime code. The Storybook app is private and is not
published.

## Supported versions

The packages are `0.x`. Only the latest published version of each package receives fixes.
