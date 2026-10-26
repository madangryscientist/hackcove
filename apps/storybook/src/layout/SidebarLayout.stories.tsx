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

const orgRail = (
  <NavTabs
    orientation="vertical"
    label="Organisations"
    items={orgs.map((label, i) => ({ label, href: `#${label}`, active: i === 0 }))}
  />
);

export const Orgs: S = {
  render: () => (
    <DemoShell>
      <SidebarLayout rail={orgRail}>
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

/** A vertical `NavTabs` is the rail: a short list of sections beside the page. */
export const DoSections: S = {
  render: () => (
    <SidebarLayout
      rail={
        <NavTabs
          orientation="vertical"
          label="Settings"
          items={[
            { label: "Profile", href: "#profile", active: true },
            { label: "Billing", href: "#billing" },
            { label: "Team", href: "#team" },
          ]}
        />
      }
    >
      <PageHeader title="Profile" subtitle="Your name and email." />
      <Card title="Account">
        <Body as="p">Naledi Mokoena, naledi@example.com</Body>
      </Card>
    </SidebarLayout>
  ),
};

/** The default, horizontal `NavTabs` wraps into a ragged block in the rail. Give the rail `orientation="vertical"`. */
export const DontSections: S = {
  render: () => (
    <SidebarLayout
      rail={
        <NavTabs
          label="Settings"
          items={[
            { label: "Profile", href: "#profile", active: true },
            { label: "Billing", href: "#billing" },
            { label: "Team", href: "#team" },
          ]}
        />
      }
    >
      <PageHeader title="Profile" subtitle="Your name and email." />
      <Card title="Account">
        <Body as="p">Naledi Mokoena, naledi@example.com</Body>
      </Card>
    </SidebarLayout>
  ),
};
