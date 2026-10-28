import type { Meta, StoryObj } from "@storybook/react-vite";
import { Checkbox, Cluster, Text } from "@hackcove/ui";

const meta: Meta = { title: "UI/Checkbox" };
export default meta;
type S = StoryObj;

export const Unchecked: S = {
  render: () => <Checkbox label="Open now" />,
};
export const Checked: S = {
  render: () => <Checkbox label="Open now" defaultChecked />,
};
export const Small: S = {
  render: () => <Checkbox label="Paid" size="sm" defaultChecked />,
};
/** No label, for a table cell: name it with `aria-label`. */
export const Bare: S = {
  render: () => <Checkbox aria-label="Select row" size="sm" />,
};
export const Disabled: S = {
  render: () => <Checkbox label="Open now" disabled />,
};
/** `align="start"` puts the box on the first line of a label that wraps; the default centres it on all of them. */
export const MultiLine: S = {
  render: () => (
    <div className="flex w-64 flex-col gap-4">
      <Checkbox
        label="Email me when a shop I follow posts a new find, and a weekly summary of the best ones"
        defaultChecked
      />
      <Checkbox
        align="start"
        label="Email me when a shop I follow posts a new find, and a weekly summary of the best ones"
        defaultChecked
      />
    </div>
  ),
};

/** `description` is a muted line under the label that the box is described by; the box sits on the label's first line. */
export const WithDescription: S = {
  render: () => (
    <div className="flex w-72 flex-col gap-4">
      <Checkbox
        label="Weekly summary"
        description="One email on Mondays with the best finds from the shops you follow."
        defaultChecked
      />
      <Checkbox size="sm" label="Price drops" description="Only for items on your watchlist." />
      <Checkbox label="Weekly summary" description="Paused while you are away." disabled />
    </div>
  ),
};

/** A yes or no is a `Checkbox` with its `label`: the whole label is the click target. */
export const DoLabel: S = {
  render: () => <Checkbox label="Email me when a shop I follow posts" defaultChecked />,
};

/** A checkbox with the words beside it, not in it, names nothing: clicking the words does nothing. */
export const DontLabel: S = {
  render: () => (
    <Cluster gap="sm">
      <Checkbox />
      <Text>Email me when a shop I follow posts</Text>
    </Cluster>
  ),
};

/** In a table cell there is no room for words: leave the `label` out, use `size="sm"` and name the box with `aria-label`. */
export const DoRow: S = {
  render: () => <Checkbox size="sm" aria-label="Select row" />,
};

/** `sm`, `md` (the default) and `lg`: the box grows with the label. */
export const Sizes: S = {
  render: () => (
    <div className="flex flex-col gap-2">
      {(["sm", "md", "lg"] as const).map((size) => (
        <Checkbox key={size} size={size} label={`Paid, ${size}`} defaultChecked />
      ))}
    </div>
  ),
};
