import type { ComponentPage } from "./types";

/** The page for one choice of a few, joined: it sits in the Forms section of the rail, after the dates and before Fieldset. */
export const groupPages: ComponentPage[] = [
  {
    slug: "segmented-control",
    name: "SegmentedControl",
    summary: "A joined group of options where one is filled.",
    whenToUse: "A mode or a range chosen in place: daily or weekly, split or even.",
    siblings: [
      { slug: "tabs", when: "The choice switches the panel right under the row." },
      {
        slug: "fieldset",
        when: "Several toggles can be on at once and narrow a list: pressed `Button`s in a `Fieldset`.",
      },
    ],
    pairs: ["SegmentedControl/Mode", "SegmentedControl/DisabledReason", "SegmentedControl/Links"],
    usage: {
      do: [
        "Two to five short options. The caller owns `value` and `onChange`; `label` names the group.",
        "`size` is `sm`, `md` (default) or `lg`, the heights of a `Button`.",
        "An on/off setting is a `Checkbox` or a `Switch`; a long list is a `Select`.",
        "Switching the panel under a row of headings is `Tabs`.",
        "A `count` sits muted after the label.",
        "An option that cannot be chosen yet takes a `disabledReason` that says why; `disabled` on the group disables every option.",
        "Options that go to another page are links: `href` on each, drawn by the app's router link through `LinkProvider`. `value` marks the current page.",
      ],
    },
    accessibility: [
      "Buttons form a `radiogroup` named by `label`; each option is a `radio` with `aria-checked`.",
      "The group is one tab stop. The arrow keys (all four), Home and End move to the next enabled option and choose it.",
      "An option with `disabledReason` is `aria-disabled`: the arrow keys reach it and choose nothing, and the reason shows as a tooltip on hover, keyboard focus and a tap, read out as its description (the native `title` without CSS anchor positioning). A `disabled` option is skipped.",
      'Links form a `<nav>` named by `label`, and the current one has `aria-current="page"`.',
      "The focus ring comes from the component.",
    ],
    api: ["SegmentedControl"],
  },
];
