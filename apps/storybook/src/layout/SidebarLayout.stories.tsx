import type { Meta, StoryObj } from "@storybook/react-vite";
import { Body, Button, Card, NavTabs, PageHeader, SidebarLayout, Stack } from "@hackcove/ui";
import { DemoShell, layoutPage } from "./DemoShell";

/**
 * A vertical link list beside the canvas, both inside the shell's Container, so the rail starts at
 * the header logo's x and the canvas ends at the header's right edge. The rail has no background;
 * it stacks above the canvas below `md`. Not in the no-jump title check (its canvas sits right of
 * the rail); the e2e asserts the shared edges on their own terms.
 */
const meta: Meta = {
  title: "Layout/SidebarLayout",
  parameters: { bare: true },
  beforeEach: layoutPage,
};
export default meta;
type S = StoryObj;

const orgs = ["Hack Cove", "Acme", "Northwind", "Initech"];

const rail = (
  <NavTabs
    orientation="vertical"
    label="Organisations"
    items={orgs.map((label, i) => ({ label, href: `#${label}`, active: i === 0 }))}
  />
);

export const Orgs: S = {
  render: () => (
    <DemoShell>
      <SidebarLayout rail={rail}>
        <PageHeader
          title="Hack Cove"
          subtitle="3 projects"
          actions={<Button>New project</Button>}
        />
        <Stack>
          <Card title="Projects">
            <Body as="p">Storybook, Dashboard, Site.</Body>
          </Card>
        </Stack>
      </SidebarLayout>
    </DemoShell>
  ),
};
