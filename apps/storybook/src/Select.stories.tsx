import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, Field, Select } from "@hackcove/ui";

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
  parameters: { layout: "padded" },
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

/** Choosing one of several is a `Select` in a `Field`. */
export const DoChoice: S = {
  render: () => (
    <Field label="Category" htmlFor="do-category">
      <Select id="do-category" defaultValue="books">
        <option value="books">Books</option>
        <option value="clothes">Clothes</option>
        <option value="furniture">Furniture</option>
        <option value="records">Records</option>
        <option value="toys">Toys</option>
      </Select>
    </Field>
  ),
};

/** A yes or no is not a choice from a list: it is a `Checkbox`. */
export const DontChoice: S = {
  render: () => (
    <Field label="Open now" htmlFor="dont-open">
      <Select id="dont-open" defaultValue="yes">
        <option value="yes">Yes</option>
        <option value="no">No</option>
      </Select>
    </Field>
  ),
};

/** `sm`, `md` (the default) and `lg`. */
export const Sizes: S = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      {(["sm", "md", "lg"] as const).map((size) => (
        <Select key={size} size={size} width="md" aria-label={`Rating ${size}`} defaultValue={5}>
          {rating}
        </Select>
      ))}
    </div>
  ),
};
