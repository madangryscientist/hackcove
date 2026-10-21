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
export const Disabled: S = {
  render: () => <Input placeholder="Your name" disabled />,
};
