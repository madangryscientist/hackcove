import type { Meta, StoryObj } from "@storybook/react-vite";
import { Breadcrumbs, crumbLinkClass, type LinkRenderProps } from "@hackcove/ui";

const meta: Meta = { title: "UI/Breadcrumbs" };
export default meta;
type S = StoryObj;

/** A parent crumb is `{ label, href }` and the last is plain text: the trail that leads back up, ending at the current page. */
export const DoTrail: S = {
  render: () => (
    <Breadcrumbs
      crumbs={[
        { label: "Projects", href: "#projects" },
        { label: "Launch film", href: "#launch-film" },
        "Shots",
      ]}
    />
  ),
};

/** Parents given as plain text look like the trail but lead nowhere, so a reader cannot go back up. */
export const DontTrail: S = {
  render: () => <Breadcrumbs crumbs={["Projects", "Launch film", "Shots"]} />,
};

/** Breadcrumbs show where the page sits in a hierarchy. */
export const DoHierarchy: S = {
  render: () => (
    <Breadcrumbs
      crumbs={[{ label: "Acme", href: "#acme" }, { label: "Quotes", href: "#quotes" }, "Quote 12"]}
    />
  ),
};

/** Siblings are not a hierarchy: switching between peer sections is `NavTabs`. */
export const DontHierarchy: S = {
  render: () => (
    <Breadcrumbs
      crumbs={[
        { label: "Quotes", href: "#quotes" },
        { label: "Invoices", href: "#invoices" },
        "Receipts",
      ]}
    />
  ),
};

const link = (href: string, label: string) => (
  <a href={href} className={crumbLinkClass}>
    {label}
  </a>
);

export const Two: S = {
  render: () => <Breadcrumbs crumbs={[link("/", "Projects"), "Hack Cove"]} />,
};

export const Four: S = {
  render: () => (
    <Breadcrumbs
      crumbs={[link("/", "Org"), link("/project", "Project"), link("/build", "Build"), "Snapshot"]}
    />
  ),
};

export const PlainParents: S = {
  render: () => <Breadcrumbs crumbs={["Org", "Project", "Build", "Snapshot"]} />,
};

export const LongTruncates: S = {
  render: () => (
    <div className="flex w-72">
      <Breadcrumbs
        crumbs={[
          link("/", "An organisation with a very long name"),
          link("/project", "A project whose name keeps going well past the width"),
          link("/build", "Build 2026-10-22"),
          "The snapshot you are looking at right now, with an even longer title",
        ]}
      />
    </div>
  ),
};

/** Stands in for a router's <Link to>: takes `to`, spreads the rest on an anchor. */
function FakeLink({ to, ...rest }: { to: string } & LinkRenderProps) {
  return <a href={`#${to}`} {...rest} />;
}

/** A crumb object links with `href` or draws the app's own Link with `render`; the last is never a link. */
export const LinkCrumbs: S = {
  render: () => (
    <Breadcrumbs
      crumbs={[
        { label: "Quotes", render: (p) => <FakeLink to="/quotes" {...p} /> },
        { label: "Docs", href: "https://example.com/docs", external: true },
        "Quote 12",
      ]}
    />
  ),
};
