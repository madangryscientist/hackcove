import type { Meta, StoryObj } from "@storybook/react-vite";
import { Select } from "@hackcove/ui";

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
export const Disabled: S = {
  render: () => (
    <Select defaultValue={5} disabled>
      {rating}
    </Select>
  ),
};
