import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Card,
  Checkbox,
  Cluster,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Text,
} from "@hackcove/ui-react";

const meta: Meta = { title: "Forms/Checkbox" };
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

/** A ticked box inside a Card or a table row draws its tick above the lifted field, not under it. */
export const InCard: S = {
  render: () => (
    <div className="flex w-96 flex-col gap-4">
      <Card title="Notifications">
        <div className="flex flex-col gap-3">
          <Checkbox label="Email me when a shop I follow posts" defaultChecked />
          <Checkbox label="Weekly summary" />
        </div>
      </Card>
      <Card title="Shops">
        <Table variant="plain" caption="Shops">
          <TableHead>
            <TableRow>
              <TableHeaderCell>
                <Checkbox aria-label="Select all" size="sm" />
              </TableHeaderCell>
              <TableHeaderCell>Shop</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>
                <Checkbox aria-label="Select Hack Cove Finds" size="sm" defaultChecked />
              </TableCell>
              <TableCell tone="strong">Hack Cove Finds</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>
    </div>
  ),
};

/** `sm`, `md` (the default) and `lg`: the box grows with the label. */
export const Sizes: S = {
  render: () => (
    <div className="flex flex-col gap-2">
      {(["sm", "md", "lg"] as const).map((size) => (
        <Cluster key={size} gap="md">
          <Checkbox size={size} label={`Paid, ${size}`} />
          <Checkbox size={size} label={`Paid, ${size}`} defaultChecked />
        </Cluster>
      ))}
    </div>
  ),
};
