import type { Meta, StoryObj } from "@storybook/react-vite";
import { Breadcrumbs, Button, crumbLinkClass, NavTabs, PageHeader, Text } from "@hackcove/ui";
import { DemoShell, layoutPage } from "./DemoShell";

const meta: Meta = {
  title: "Layout/PageHeader",
  parameters: { bare: true },
  beforeEach: layoutPage,
};
export default meta;
type S = StoryObj;

export const AllSlots: S = {
  render: () => (
    <DemoShell>
      <PageHeader
        breadcrumbs={
          <Breadcrumbs
            crumbs={[
              <a key="org" href="#" className={crumbLinkClass}>
                Org
              </a>,
              <a key="project" href="#" className={crumbLinkClass}>
                Hack Cove
              </a>,
              "Build 412",
            ]}
          />
        }
        title="Build 412"
        subtitle="main · 4c93f0b · 3 changed, 1 new"
        actions={
          <>
            <Button variant="outline">Reject</Button>
            <Button>Accept all</Button>
          </>
        }
        tabs={
          <NavTabs
            label="Build"
            items={[
              { label: "Changed", href: "#changed", active: true },
              { label: "New", href: "#new" },
              { label: "Unchanged", href: "#unchanged" },
            ]}
          />
        }
      />
      <Text as="p">The first block starts here, the same distance under every header.</Text>
    </DemoShell>
  ),
};

export const TitleOnly: S = {
  render: () => (
    <DemoShell>
      <PageHeader title="Settings" />
      <Text as="p">The first block starts here.</Text>
    </DemoShell>
  ),
};
