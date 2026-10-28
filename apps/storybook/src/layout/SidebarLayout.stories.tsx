import type { Meta, StoryObj } from "@storybook/react-vite";
import { AppShell, Button, Card, Tabs, PageHeader, SidebarLayout, Stack, Text } from "@hackcove/ui";
import { DemoShell, layoutPage } from "./DemoShell";

/**
 * A vertical link list beside the canvas, both inside the shell's Container, so the rail starts at
 * the header logo's x and the canvas ends at the header's right edge. The rail has no background;
 * it stacks above the canvas below `md`, or folds behind a disclosure when it sets `railLabel`. Not in the no-jump title check (its canvas sits right of
 * the rail); the e2e asserts the shared edges on their own terms.
 */
const meta: Meta = {
  title: "Layout/SidebarLayout",
  parameters: { bare: true },
  beforeEach: layoutPage,
};
export default meta;
type S = StoryObj;

/** A whole page with a rail: the shell with its brand and nav, then the layout with a vertical pill `Tabs` in `rail` and the page in `children`. */
export const FullPage: S = {
  render: () => (
    <AppShell
      brand={<a href="#">Hack Cove</a>}
      nav={
        <Tabs
          variant="pill"
          label="Main"
          items={[
            { label: "Quotes", href: "#quotes", active: true },
            { label: "Clients", href: "#clients" },
          ]}
        />
      }
    >
      <SidebarLayout
        rail={
          <Tabs
            variant="pill"
            orientation="vertical"
            label="Organisations"
            items={[
              { label: "Hack Cove", href: "#hack-cove", active: true },
              { label: "Acme", href: "#acme" },
              { label: "Northwind", href: "#northwind" },
            ]}
          />
        }
      >
        <PageHeader
          title="Hack Cove"
          subtitle="3 projects"
          actions={<Button>New project</Button>}
        />
        <Card title="Projects">
          <Text as="p">Storybook, Dashboard, Site.</Text>
        </Card>
      </SidebarLayout>
    </AppShell>
  ),
};

const orgs = ["Hack Cove", "Acme", "Northwind", "Initech"];

const orgRail = (
  <Tabs
    variant="pill"
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
            <Text as="p">Storybook, Dashboard, Site.</Text>
          </Card>
        </Stack>
      </SidebarLayout>
    </DemoShell>
  ),
};

const sections = Array.from({ length: 24 }, (_, i) => `Section ${i + 1}`);

/**
 * A long rail sets `railLabel`: from `md` it is the same rail beside the page; below `md` it folds
 * behind a disclosure of that name, closed, so the page comes first on a phone.
 */
export const LongRail: S = {
  render: () => (
    <DemoShell>
      <SidebarLayout
        railLabel="All sections"
        rail={
          <Tabs
            variant="pill"
            orientation="vertical"
            label="Sections"
            items={sections.map((label, i) => ({ label, href: `#${label}`, active: i === 0 }))}
          />
        }
      >
        <PageHeader title="Section 1" subtitle="24 sections." />
        <Stack>
          <Card title="Overview">
            <Text as="p">The page is first on a phone; the rail opens from the disclosure.</Text>
          </Card>
        </Stack>
      </SidebarLayout>
    </DemoShell>
  ),
};

/** A vertical pill `Tabs` is the rail: a short list of sections beside the page. */
export const DoSections: S = {
  render: () => (
    <SidebarLayout
      rail={
        <Tabs
          variant="pill"
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
        <Text as="p">Naledi Mokoena, naledi@example.com</Text>
      </Card>
    </SidebarLayout>
  ),
};

/** The default, horizontal pill `Tabs` wraps into a ragged block in the rail. Give the rail `orientation="vertical"`. */
export const DontSections: S = {
  render: () => (
    <SidebarLayout
      rail={
        <Tabs
          variant="pill"
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
        <Text as="p">Naledi Mokoena, naledi@example.com</Text>
      </Card>
    </SidebarLayout>
  ),
};
