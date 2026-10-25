import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, Select } from "@hackcove/ui";

const meta: Meta = { title: "UI/Select" };
export default meta;
type S = StoryObj;

const rating = (
  <>
    <option value={5}>★★★★★ (5)</option>
    <option value={4}>★★★★ (4)</option>
    <option value={3}>★★★ (3)</option>
    <option value={2}>★★ (2)</option>
    <option value={1}>★ (1)</option>
  </>
);

export const Default: S = {
  render: () => <Select defaultValue={5}>{rating}</Select>,
};
export const Small: S = {
  render: () => (
    <Select size="sm" width="md" aria-label="Rating" defaultValue={5}>
      {rating}
    </Select>
  ),
};
export const AutoWidth: S = {
  render: () => (
    <Select width="auto" aria-label="Rating" defaultValue={5}>
      {rating}
    </Select>
  ),
};
/** `width="fill"` grows to the room left in a row, so the button beside it stays on the line. */
export const FillWidth: S = {
  render: () => (
    <div className="flex max-w-lg flex-wrap items-center gap-2">
      <Select width="fill" aria-label="Rating" defaultValue={5}>
        {rating}
      </Select>
      <Button>Apply</Button>
    </div>
  ),
};
export const Disabled: S = {
  render: () => (
    <Select defaultValue={5} disabled>
      {rating}
    </Select>
  ),
};
