# hackcove soul

The design system behind Hack Cove's sites and dashboard: components and themes, each its own
small package.

## What we optimise for

**A theme is a folder.** Adding a look should be copying a directory, not editing the system.
If a change needs a registry, a list or a switch statement, the design is wrong.

**Components know no palette.** They say `text-slate-900`; a theme decides what that is. The
moment a component carries a colour, every theme has to fight it.

**Small and boring.** Few dependencies, plain CSS, plain React. Add a prop or a package only when
a real consumer needed it.

## How we work

Verify by looking. A green test run does not render a theme: open Storybook, flip the switcher,
and check the dashboard and the site still look the same.

Write plainly. No hype, no exclamation marks.

## Standing lines

- Never publish without Jacobus saying so; only the planner pushes.
- Never move a consumer's existing look by accident.
