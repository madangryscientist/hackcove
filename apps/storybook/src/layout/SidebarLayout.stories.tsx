import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  AppShell,
  Button,
  Card,
  DetailLayout,
  KeyValue,
  KeyValueList,
  Tabs,
  PageHeader,
  SidebarLayout,
  Stack,
  Text,
} from "@slashsuite/ui-react";
import { DemoShell, layoutPage } from "./DemoShell";

/**
 * A vertical link list beside the canvas, both inside the shell's Container, so the rail starts at
 * the header logo's x and the canvas ends at the header's right edge. The rail has no background;
 * it stacks above the canvas below `md`, or folds behind a disclosure when it sets `asideLabel`. Its canvas sits right of the rail, so
 * the e2e asserts the shared edges on their own terms. From `md` the rail stays in view
 * under the shell's header as a long page scrolls, with or without `asideLabel`; a rail taller than
 * the screen scrolls itself. Below `md` nothing sticks.
 */
const meta: Meta = {
  title: "Page layouts/SidebarLayout",
  parameters: { layout: "fullscreen", bare: true },
  beforeEach: layoutPage,
};
export default meta;
type S = StoryObj;

/** A whole page with a rail: the shell with its brand and nav, then the layout with a vertical `Tabs` in `aside` and the page in `children`. */
export const FullPage: S = {
  render: () => (
    <AppShell
      brand={<a href="#">Hack Cove</a>}
      nav={
        <Tabs
          label="Main"
          items={[
            { label: "Quotes", href: "#quotes", selected: true },
            { label: "Clients", href: "#clients" },
          ]}
        />
      }
    >
      <SidebarLayout
        aside={
          <Tabs
            orientation="vertical"
            label="Organisations"
            items={[
              { label: "Hack Cove", href: "#hack-cove", selected: true },
              { label: "Acme", href: "#acme" },
              { label: "Northwind", href: "#northwind" },
            ]}
          />
        }
      >
        <PageHeader
          title="Hack Cove"
          description="3 projects"
          actions={<Button>New project</Button>}
        />
        <Card title="Projects">
          <Text>Storybook, Dashboard, Site.</Text>
        </Card>
      </SidebarLayout>
    </AppShell>
  ),
};

const orgs = ["Hack Cove", "Acme", "Northwind", "Initech"];

const orgRail = (
  <Tabs
    orientation="vertical"
    label="Organisations"
    items={orgs.map((label, i) => ({ label, href: `#${label}`, selected: i === 0 }))}
  />
);

export const Orgs: S = {
  render: () => (
    <DemoShell>
      <SidebarLayout aside={orgRail}>
        <PageHeader
          title="Hack Cove"
          description="3 projects"
          actions={<Button>New project</Button>}
        />
        <Stack>
          <Card title="Projects">
            <Text>Storybook, Dashboard, Site.</Text>
          </Card>
        </Stack>
      </SidebarLayout>
    </DemoShell>
  ),
};

const sections = Array.from({ length: 24 }, (_, i) => `Section ${i + 1}`);

/**
 * A long rail sets `asideLabel`: from `md` it is the same rail beside the page; below `md` it folds
 * behind a disclosure of that name, closed, so the page comes first on a phone.
 */
export const LongRail: S = {
  render: () => (
    <DemoShell>
      <SidebarLayout
        asideLabel="All sections"
        aside={
          <Tabs
            orientation="vertical"
            label="Sections"
            items={sections.map((label, i) => ({ label, href: `#${label}`, selected: i === 0 }))}
          />
        }
      >
        <PageHeader title="Section 1" description="24 sections." />
        <Stack>
          <Card title="Overview">
            <Text>The page is first on a phone; the rail opens from the disclosure.</Text>
          </Card>
        </Stack>
      </SidebarLayout>
    </DemoShell>
  ),
};

const longPage = Array.from({ length: 12 }, (_, i) => (
  <Card key={i} title={`Block ${i + 1}`}>
    <Text>
      A block of a long page. The rail beside it stays in view under the header while this scrolls.
    </Text>
  </Card>
));

/** A long page: from `md` the rail stays in view under the header as it scrolls, with `asideLabel` set. */
export const StickyRail: S = {
  render: () => (
    <DemoShell>
      <SidebarLayout
        asideLabel="All sections"
        aside={
          <Tabs
            orientation="vertical"
            label="Sections"
            items={sections
              .slice(0, 8)
              .map((label, i) => ({ label, href: `#${label}`, selected: i === 0 }))}
          />
        }
      >
        <PageHeader title="Section 1" description="8 sections." />
        <Stack>{longPage}</Stack>
      </SidebarLayout>
    </DemoShell>
  ),
};

const manySections = Array.from({ length: 60 }, (_, i) => `Section ${i + 1}`);

/** A rail taller than the screen scrolls inside itself, so its last link is reachable while the page scrolls. */
export const TallRail: S = {
  render: () => (
    <DemoShell>
      <SidebarLayout
        asideLabel="All sections"
        aside={
          <Tabs
            orientation="vertical"
            label="Sections"
            items={manySections.map((label, i) => ({
              label,
              href: `#${label}`,
              selected: i === 0,
            }))}
          />
        }
      >
        <PageHeader title="Section 1" description="60 sections." />
        <Stack>{longPage}</Stack>
      </SidebarLayout>
    </DemoShell>
  ),
};

/**
 * A rail whose current link is low in the list, as on the docs' Button page: once the page has
 * loaded, the rail scrolls itself (never the page) so the current link is in view, its scrollbar is
 * the thin themed one, and below `md` the disclosure reads the label and the current link.
 */
export const CurrentLow: S = {
  render: () => (
    <DemoShell>
      <SidebarLayout
        asideLabel="All sections"
        aside={
          <Tabs
            orientation="vertical"
            label="Sections"
            items={manySections.map((label, i) => ({
              label,
              href: `#${label}`,
              selected: i === 44,
            }))}
          />
        }
      >
        <PageHeader title="Section 45" description="60 sections, the 45th is current." />
        <Stack>{longPage}</Stack>
      </SidebarLayout>
    </DemoShell>
  ),
};

/** A rail and a `DetailLayout` with `sticky` in its canvas, as the docs use them: both stay in view. */
export const WithDetail: S = {
  render: () => (
    <DemoShell>
      <SidebarLayout
        asideLabel="All sections"
        aside={
          <Tabs
            orientation="vertical"
            label="Sections"
            items={sections
              .slice(0, 8)
              .map((label, i) => ({ label, href: `#${label}`, selected: i === 0 }))}
          />
        }
      >
        <DetailLayout
          title="Section 1"
          description="A record with its facts."
          sticky
          aside={
            <Card title="On this page">
              <KeyValueList>
                <KeyValue label="Blocks">12</KeyValue>
                <KeyValue label="Status">Draft</KeyValue>
              </KeyValueList>
            </Card>
          }
        >
          {longPage}
        </DetailLayout>
      </SidebarLayout>
    </DemoShell>
  ),
};

/** A vertical pill `Tabs` is the rail: a short list of sections beside the page. */
export const DoSections: S = {
  render: () => (
    <SidebarLayout
      aside={
        <Tabs
          orientation="vertical"
          label="Settings"
          items={[
            { label: "Profile", href: "#profile", selected: true },
            { label: "Billing", href: "#billing" },
            { label: "Team", href: "#team" },
          ]}
        />
      }
    >
      <PageHeader title="Profile" description="Your name and email." />
      <Card title="Account">
        <Text>Naledi Mokoena, naledi@example.com</Text>
      </Card>
    </SidebarLayout>
  ),
};

/** The default, horizontal pill `Tabs` wraps into a ragged block in the rail. Give the rail `orientation="vertical"`. */
export const DontSections: S = {
  render: () => (
    <SidebarLayout
      aside={
        <Tabs
          label="Settings"
          items={[
            { label: "Profile", href: "#profile", selected: true },
            { label: "Billing", href: "#billing" },
            { label: "Team", href: "#team" },
          ]}
        />
      }
    >
      <PageHeader title="Profile" description="Your name and email." />
      <Card title="Account">
        <Text>Naledi Mokoena, naledi@example.com</Text>
      </Card>
    </SidebarLayout>
  ),
};

/** While `loading` the layout owns the wait: the header draws as itself and every part inside waits with it. */
export const Loading: StoryObj<{ loading: boolean }> = {
  args: { loading: true },
  render: ({ loading }) => (
    <DemoShell>
      <SidebarLayout
        loading={loading}
        aside={
          <Tabs
            orientation="vertical"
            label="Settings"
            items={[{ label: "Profile", href: "#profile", selected: true }]}
          />
        }
      >
        <PageHeader title={loading ? null : "Profile"} />
      </SidebarLayout>
    </DemoShell>
  ),
};
