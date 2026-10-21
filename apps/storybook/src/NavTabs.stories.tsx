import type { Meta, StoryObj } from "@storybook/react-vite";
import { NavTabs } from "@hackcove/ui";

const meta: Meta = { title: "UI/NavTabs" };
export default meta;
type S = StoryObj;

export const Default: S = {
  render: () => (
    <NavTabs
      label="Main"
      items={[
        { label: "Map", href: "/" },
        { label: "Directory", href: "/stores", active: true },
        { label: "Events", href: "/events" },
        { label: "About", href: "/about" },
      ]}
    />
  ),
};
