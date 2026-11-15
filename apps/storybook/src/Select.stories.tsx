import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, Field, Select } from "@hackcove/ui-react";
import { CompactApp } from "./typeSteps";

const meta: Meta = { title: "Forms/Select" };
export default meta;
type S = StoryObj;

const rating = [
  { value: "5", label: "★★★★★ (5)" },
  { value: "4", label: "★★★★ (4)" },
  { value: "3", label: "★★★ (3)" },
  { value: "2", label: "★★ (2)" },
  { value: "1", label: "★ (1)" },
];

export const Default: S = {
  render: () => <Select defaultValue="5" items={rating} />,
};
export const Small: S = {
  render: () => <Select size="sm" width="md" aria-label="Rating" defaultValue="5" items={rating} />,
};
export const AutoWidth: S = {
  render: () => <Select width="auto" aria-label="Rating" defaultValue="5" items={rating} />,
};
/** `width="fill"` grows to the room left in a row, so the button beside it stays on the line. */
export const FillWidth: S = {
  parameters: { layout: "padded" },
  render: () => (
    <div className="flex max-w-lg flex-wrap items-center gap-2">
      <Select width="fill" aria-label="Rating" defaultValue="5" items={rating} />
      <Button>Apply</Button>
    </div>
  ),
};
export const Disabled: S = {
  render: () => <Select defaultValue="5" disabled items={rating} />,
};

/** Choosing one of several is a `Select` in a `Field`. */
export const DoChoice: S = {
  render: () => (
    <Field label="Category" htmlFor="do-category">
      <Select
        id="do-category"
        defaultValue="books"
        items={[
          { value: "books", label: "Books" },
          { value: "clothes", label: "Clothes" },
          { value: "furniture", label: "Furniture" },
          { value: "records", label: "Records" },
          { value: "toys", label: "Toys" },
        ]}
      />
    </Field>
  ),
};

/** A yes or no is not a choice from a list: it is a `Checkbox`. */
export const DontChoice: S = {
  render: () => (
    <Field label="Open now" htmlFor="dont-open">
      <Select
        id="dont-open"
        defaultValue="yes"
        items={[
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
        ]}
      />
    </Field>
  ),
};

/** `sm`, `md` (the default) and `lg`. */
const sizes = () => (
  <div className="flex flex-wrap items-center gap-2">
    {(["sm", "md", "lg"] as const).map((size) => (
      <Select
        key={size}
        size={size}
        width="md"
        aria-label={`Rating ${size}`}
        defaultValue="5"
        items={rating}
      />
    ))}
  </div>
);

export const Sizes: S = {
  render: sizes,
};

/** The same sizes in an app that set `AppShell density="compact"`: each is one type step down. */
export const SizesCompact: S = {
  parameters: { layout: "fullscreen" },
  render: () => <CompactApp>{sizes()}</CompactApp>,
};

/** In an errored `Field`, the select takes a red edge and is described by the error. */
export const Invalid: S = {
  render: () => (
    <div className="max-w-md">
      <Field label="Rating" error="Pick a rating.">
        <Select defaultValue="1" items={rating} />
      </Field>
    </div>
  ),
};
