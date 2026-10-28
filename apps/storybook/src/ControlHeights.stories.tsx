import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, DateField, IconButton, Input, SegmentedControl, Select } from "@hackcove/ui";

const meta: Meta = { title: "UI/Control heights" };
export default meta;
type S = StoryObj;

type Size = "sm" | "md" | "lg";
const SIZES: Size[] = ["sm", "md", "lg"];

const items = [
  { value: "a", label: "Day" },
  { value: "b", label: "Week" },
];

/** Every control a row can hold, at one `size`. Each carries `data-control` so the e2e can measure it. */
function Row({ size }: { size: Size }) {
  return (
    <div data-size={size} className="flex flex-wrap items-start gap-3">
      <Input data-control="Input" aria-label="Input" size={size} width="sm" />
      <Select data-control="Select" aria-label="Select" size={size} width="sm">
        <option>One</option>
      </Select>
      <Input type="search" data-control="Search" aria-label="Search" size={size} width="sm" />
      <DateField data-control="DateField" aria-label="Date field" size={size} />
      <DateField
        calendar
        data-control="DateField calendar"
        aria-label="Date field with calendar"
        size={size}
      />
      <Button data-control="Button" size={size}>
        Button
      </Button>
      <Button data-control="Button href" href="#heights" size={size}>
        Link
      </Button>
      <IconButton data-control="IconButton" label="Icon button" size={size}>
        +
      </IconButton>
      <SegmentedControl
        data-control="SegmentedControl"
        label="Range"
        size={size}
        value="a"
        onChange={() => undefined}
        items={items}
      />
    </div>
  );
}

/** The controls of one size stand at one height: 26px at `sm`, 38px at `md`, 46px at `lg`. The e2e measures this row by row. */
export const Heights: S = {
  render: () => (
    <div className="flex flex-col gap-6">
      {SIZES.map((size) => (
        <Row key={size} size={size} />
      ))}
    </div>
  ),
};
