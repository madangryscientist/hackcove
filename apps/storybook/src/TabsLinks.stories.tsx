import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, Stack, Tabs, type LinkRenderProps } from "@hackcove/ui";

const meta: Meta = { title: "UI/Tabs links" };
export default meta;
type S = StoryObj;

/** A rail of links is pill `Tabs` of links with `orientation="vertical"`: one nav landmark, the current page marked. */
export const DoRail: S = {
  render: () => (
    <Tabs
      variant="pill"
      orientation="vertical"
      label="Sections"
      items={[
        { label: "Overview", href: "#overview" },
        { label: "Button", href: "#button", active: true },
        { label: "Card", href: "#card" },
      ]}
    />
  ),
};

/** A stack of ghost link `Button`s is not a nav landmark, and nothing marks the current page. */
export const DontRail: S = {
  render: () => (
    <Stack gap="xs">
      <Button href="#overview" variant="ghost">
        Overview
      </Button>
      <Button href="#button" variant="ghost">
        Button
      </Button>
      <Button href="#card" variant="ghost">
        Card
      </Button>
    </Stack>
  ),
};

export const Default: S = {
  render: () => (
    <Tabs
      variant="pill"
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

/** `orientation="vertical"`: one link per line, for a `SidebarLayout` rail. The same pills and `aria-current`. */
export const Vertical: S = {
  render: () => (
    <div className="w-56">
      <Tabs
        variant="pill"
        orientation="vertical"
        label="Sections"
        items={[
          { label: "Overview", href: "/" },
          { label: "Button", href: "/button", active: true },
          { label: "Card", href: "/card" },
          { label: "Tabs", href: "/tabs" },
        ]}
      />
    </div>
  ),
};

/** Stands in for a router's <Link to>: takes `to`, spreads the rest on an anchor. */
function FakeLink({ to, ...rest }: { to: string } & LinkRenderProps) {
  return <a href={`#${to}`} {...rest} />;
}

/** Each tab's `render` draws the app's own Link and gets the tab's classes and `aria-current`. */
export const WithRouterLink: S = {
  render: () => (
    <Tabs
      variant="pill"
      label="Main"
      items={[
        { label: "Quotes", active: true, render: (p) => <FakeLink to="/quotes" {...p} /> },
        { label: "Settings", render: (p) => <FakeLink to="/settings" {...p} /> },
        { label: "Traces", href: "https://example.com/traces", external: true },
      ]}
    />
  ),
};

/** `sm`, `md` (the default, 38px) and `lg`: the control scale. */
export const Sizes: S = {
  render: () => (
    <Stack gap="sm">
      {(["sm", "md", "lg"] as const).map((size) => (
        <Tabs
          variant="pill"
          key={size}
          size={size}
          label={`Main, ${size}`}
          items={[
            { label: "Map", href: "/" },
            { label: "Directory", href: "/stores", active: true },
          ]}
        />
      ))}
    </Stack>
  ),
};
