import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, Card, Field, Input } from "@hackcove/ui-react";
import { CompactApp } from "./typeSteps";

const meta: Meta = { title: "Forms/Input" };
export default meta;
type S = StoryObj;

export const Default: S = {
  render: () => <Input placeholder="Your name" />,
};
export const WithIcon: S = {
  render: () => <Input type="search" placeholder="Search by name, suburb or tag…" icon="search" />,
};
/** Inside a Card (or a ListRow), where a field is lifted above a stretched link, the leading icon still shows, for a plain field and a search field alike. */
export const IconInCard: S = {
  render: () => (
    <Card title="Filter stores">
      <div className="flex flex-col gap-2">
        <Input aria-label="Name" placeholder="Name" icon="search" />
        <Input
          type="search"
          aria-label="Search"
          placeholder="Search by name, suburb or tag…"
          icon="search"
        />
        <Input
          type="search"
          aria-label="Search, filled"
          defaultValue="Thrifty paper"
          icon="search"
        />
      </div>
    </Card>
  ),
};
/** A placeholder longer than the field ends with an ellipsis instead of being cut mid-word. */
export const LongPlaceholder: S = {
  render: () => (
    <div className="w-48">
      <Input
        type="search"
        aria-label="Search"
        placeholder="Search by name, suburb or tag…"
        icon="search"
      />
    </div>
  ),
};
/** `prefix`: short text inside the border, before the value, such as a currency symbol. */
export const WithPrefix: S = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Input prefix="R" inputMode="decimal" placeholder="0.00" aria-label="Amount" width="lg" />
      <Input prefix="R" size="sm" placeholder="0.00" aria-label="Small amount" width="md" />
    </div>
  ),
};
/** `sm` is compact: `text-xs`, less padding. For dense forms and table rows. */
export const Small: S = {
  render: () => <Input size="sm" placeholder="Qty" />,
};
export const SmallWithIcon: S = {
  render: () => <Input size="sm" type="search" placeholder="Find…" icon="search" />,
};
/** A fixed width replaces `w-full`; there is no class to collide with. */
export const FixedWidths: S = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      {(["xs", "sm", "md", "lg"] as const).map((width) => (
        <Input key={width} width={width} aria-label={width} placeholder={width} />
      ))}
    </div>
  ),
};
/** `auto` carries no width class: the input is as wide as the browser makes it. */
export const AutoWidth: S = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Input width="auto" aria-label="Natural" placeholder="Natural" />
      <Input
        width="md"
        size="sm"
        type="search"
        aria-label="Find"
        placeholder="Find"
        icon="search"
      />
    </div>
  ),
};
export const Disabled: S = {
  render: () => <Input placeholder="Your name" disabled />,
};
/** Once the field has a value, a themed "Clear search" button sits at the trailing edge. The browser's own cancel button is hidden. */
export const SearchWithValue: S = {
  render: () => (
    <Input
      type="search"
      aria-label="Search"
      defaultValue="Thrifty paper"
      placeholder="Search by name, suburb or tag…"
      icon="search"
    />
  ),
};
/** `width="fill"` grows to the room left in a row, so the buttons beside it stay on the line. */
export const FillWidth: S = {
  parameters: { layout: "padded" },
  render: () => (
    <div className="flex max-w-lg flex-wrap items-center gap-2">
      <Input width="fill" aria-label="Note" placeholder="Fills the row" />
      <Button>Save</Button>
      <Button variant="outline">Cancel</Button>
    </div>
  ),
};
/** `numeric` is a field for a figure: right-aligned tabular digits and the phone's number keypad. A count passes `inputMode="numeric"`; an amount takes a `prefix`. */
export const Numeric: S = {
  render: () => (
    <div className="flex max-w-lg flex-wrap items-center gap-2">
      <Input numeric inputMode="numeric" aria-label="Quantity" defaultValue="1 250" width="md" />
      <Input numeric prefix="R" aria-label="Amount" defaultValue="49.90" width="fill" />
    </div>
  ),
};

/** An amount is a `prefix` for the currency and `numeric`, which lines the digits up and brings up the number keypad. */
export const DoAmount: S = {
  render: () => <Input prefix="R" numeric width="md" aria-label="Amount" defaultValue="49.90" />,
};

/** A currency typed into the placeholder is gone as soon as the person types, and nothing keeps the digits aligned. */
export const DontAmount: S = {
  render: () => <Input placeholder="R 0.00" width="md" aria-label="Amount" />,
};

/** A count a person types is `numeric` with the whole-number keypad: a text field that keeps what was typed. */
export const DoNumber: S = {
  render: () => (
    <Field label="Quantity">
      <Input numeric inputMode="numeric" width="xs" defaultValue="12" />
    </Field>
  ),
};

/** `type="number"` drops "1 250", puts spinner arrows where the figure should end, and lets the mouse wheel change the value as the page scrolls. */
export const DontNumber: S = {
  render: () => (
    <Field label="Quantity">
      <Input type="number" width="xs" defaultValue="12" />
    </Field>
  ),
};

/** A search box is `type="search"` with an `icon`: the browser's own look is dropped and a clear button appears once there is a value. */
export const DoSearch: S = {
  render: () => (
    <Input
      type="search"
      aria-label="Search shops"
      placeholder="Search by name or suburb…"
      icon="search"
    />
  ),
};

/** A plain text input used for search has no icon and no way to clear it. */
export const DontSearch: S = {
  render: () => <Input aria-label="Search shops" placeholder="Search by name or suburb…" />,
};

/** `sm`, `md` (the default) and `lg`, plain and with an icon: the heights match a `Button` of the size. */
const sizes = () => (
  <div className="flex flex-col gap-2">
    {(["sm", "md", "lg"] as const).map((size) => (
      <div key={size} className="flex flex-wrap items-center gap-2">
        <Input size={size} width="md" placeholder={`Name, ${size}`} aria-label={`Name ${size}`} />
        <Input
          size={size}
          width="md"
          type="search"
          placeholder="Find…"
          icon="search"
          aria-label={`Find ${size}`}
        />
        <Input size={size} width="sm" prefix="R" placeholder="0.00" aria-label={`Amount ${size}`} />
        <Button size={size}>Save</Button>
      </div>
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

/** In an errored `Field`, every form of the input takes a red edge and is described by the error. */
export const Invalid: S = {
  render: () => (
    <div className="flex max-w-md flex-col gap-4">
      <Field label="Display name" error="Pick a shorter name.">
        <Input defaultValue="A very long display name indeed" />
      </Field>
      <Field label="Shop name" error="Name the shop.">
        <Input icon="search" />
      </Field>
      <Field label="Price" error="Enter a price above zero.">
        <Input prefix="R" numeric defaultValue="0.00" />
      </Field>
      <Field label="Search shops" error="Type at least two letters.">
        <Input type="search" icon="search" defaultValue="a" />
      </Field>
    </div>
  ),
};
