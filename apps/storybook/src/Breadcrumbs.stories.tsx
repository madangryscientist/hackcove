import type { Meta, StoryObj } from "@storybook/react-vite";
import { Breadcrumbs, crumbLinkClass } from "@hackcove/ui";

const meta: Meta = { title: "UI/Breadcrumbs" };
export default meta;
type S = StoryObj;

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
