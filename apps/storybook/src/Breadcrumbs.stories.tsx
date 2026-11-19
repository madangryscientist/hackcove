import type { Meta, StoryObj } from "@storybook/react-vite";
import { Breadcrumbs } from "@slashsuite/ui-react";

const meta: Meta = { title: "Navigation/Breadcrumbs" };
export default meta;
type S = StoryObj;

/** A parent crumb is `{ label, href }` and the last is plain text: the trail that leads back up, ending at the current page. */
export const DoTrail: S = {
  render: () => (
    <Breadcrumbs
      items={[
        { label: "Projects", href: "#projects" },
        { label: "Launch film", href: "#launch-film" },
        "Shots",
      ]}
    />
  ),
};

/** Parents given as plain text look like the trail but lead nowhere, so a reader cannot go back up. */
export const DontTrail: S = {
  render: () => <Breadcrumbs items={["Projects", "Launch film", "Shots"]} />,
};

/** Breadcrumbs show where the page sits in a hierarchy. */
export const DoHierarchy: S = {
  render: () => (
    <Breadcrumbs
      items={[{ label: "Acme", href: "#acme" }, { label: "Quotes", href: "#quotes" }, "Quote 12"]}
    />
  ),
};

/** Siblings are not a hierarchy: switching between peer sections is `Tabs` of links. */
export const DontHierarchy: S = {
  render: () => (
    <Breadcrumbs
      items={[
        { label: "Quotes", href: "#quotes" },
        { label: "Invoices", href: "#invoices" },
        "Receipts",
      ]}
    />
  ),
};

const link = (href: string, label: string) => ({ label, href });

export const Two: S = {
  render: () => <Breadcrumbs items={[link("/", "Projects"), "Hack Cove"]} />,
};

export const Four: S = {
  render: () => (
    <Breadcrumbs
      items={[link("/", "Org"), link("/project", "Project"), link("/build", "Build"), "Snapshot"]}
    />
  ),
};

export const PlainParents: S = {
  render: () => <Breadcrumbs items={["Org", "Project", "Build", "Snapshot"]} />,
};

export const LongTruncates: S = {
  render: () => (
    <div className="flex w-72">
      <Breadcrumbs
        items={[
          link("/", "An organisation with a very long name"),
          link("/project", "A project whose name keeps going well past the width"),
          link("/build", "Build 2026-10-22"),
          "The snapshot you are looking at right now, with an even longer title",
        ]}
      />
    </div>
  ),
};

/** A crumb object links with `href`, an in-app one through the app's `LinkProvider`; the last is never a link. */
export const LinkCrumbs: S = {
  render: () => (
    <Breadcrumbs
      items={[
        { label: "Quotes", href: "/quotes" },
        { label: "Docs", href: "https://example.com/docs", external: true },
        "Quote 12",
      ]}
    />
  ),
};
