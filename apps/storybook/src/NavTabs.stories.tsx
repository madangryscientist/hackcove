import type { Meta, StoryObj } from "@storybook/react-vite";
import { NavTabs, type LinkRenderProps } from "@hackcove/ui";

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

/** Stands in for a router's <Link to>: takes `to`, spreads the rest on an anchor. */
function FakeLink({ to, ...rest }: { to: string } & LinkRenderProps) {
  return <a href={`#${to}`} {...rest} />;
}

/** Each tab's `render` draws the app's own Link and gets the tab's classes and `aria-current`. */
export const WithRouterLink: S = {
  render: () => (
    <NavTabs
      label="Main"
      items={[
        { label: "Quotes", active: true, render: (p) => <FakeLink to="/quotes" {...p} /> },
        { label: "Settings", render: (p) => <FakeLink to="/settings" {...p} /> },
        { label: "Traces", href: "https://example.com/traces", external: true },
      ]}
    />
  ),
};
