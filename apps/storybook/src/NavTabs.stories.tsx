import type { Meta, StoryObj } from "@storybook/react-vite";
import { ButtonLink, NavTabs, Stack, type LinkRenderProps } from "@hackcove/ui";

const meta: Meta = { title: "UI/NavTabs" };
export default meta;
type S = StoryObj;

/** A rail of links is `NavTabs` with `orientation="vertical"`: one nav landmark, the current page marked. */
export const DoRail: S = {
  render: () => (
    <NavTabs
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

/** A stack of ghost `ButtonLink`s is not a nav landmark, and nothing marks the current page. */
export const DontRail: S = {
  render: () => (
    <Stack gap="xs">
      <ButtonLink href="#overview" variant="ghost">
        Overview
      </ButtonLink>
      <ButtonLink href="#button" variant="ghost">
        Button
      </ButtonLink>
      <ButtonLink href="#card" variant="ghost">
        Card
      </ButtonLink>
    </Stack>
  ),
};

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

/** `orientation="vertical"`: one link per line, for a `SidebarLayout` rail. The same pills and `aria-current`. */
export const Vertical: S = {
  render: () => (
    <div className="w-56">
      <NavTabs
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

/** `sm`, `md` (the default, 38px) and `lg`: the control scale. */
export const Sizes: S = {
  render: () => (
    <Stack gap="sm">
      {(["sm", "md", "lg"] as const).map((size) => (
        <NavTabs
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
