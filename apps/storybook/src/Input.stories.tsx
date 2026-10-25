import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input } from "@hackcove/ui";

const meta: Meta = { title: "UI/Input" };
export default meta;
type S = StoryObj;

const search = (
  <svg viewBox="0 0 20 20" fill="currentColor">
    <path
      fillRule="evenodd"
      d="M9 3.5a5.5 5.5 0 1 0 3.4 9.8l3.15 3.15a.75.75 0 1 0 1.06-1.06l-3.15-3.15A5.5 5.5 0 0 0 9 3.5Zm-4 5.5a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z"
      clipRule="evenodd"
    />
  </svg>
);

export const Default: S = {
  render: () => <Input placeholder="Your name" />,
};
export const WithIcon: S = {
  render: () => <Input type="search" placeholder="Search by name, suburb or tag…" icon={search} />,
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
  render: () => <Input size="sm" type="search" placeholder="Find…" icon={search} />,
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
        icon={search}
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
      icon={search}
    />
  ),
};
