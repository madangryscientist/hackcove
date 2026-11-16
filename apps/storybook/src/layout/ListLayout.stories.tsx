import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  AppShell,
  Button,
  Card,
  EmptyState,
  FilterGroup,
  ListLayout,
  Tabs,
  PageHeader,
  Pill,
  Stack,
  Text,
} from "@hackcove/ui-react";
import { DemoShell, layoutPage } from "./DemoShell";
import { ListPage } from "./pages";

/** The page stories keep the page title at the logo's x (bar the three asserted in e2e/layout.spec.ts); the visual check shoots each at 1280. */
const meta: Meta = {
  title: "Page layouts/ListLayout",
  parameters: { layout: "fullscreen", bare: true },
  beforeEach: layoutPage,
};
export default meta;
type S = StoryObj;

/** A whole list page: the shell with its brand and nav, then the layout with its filters and rows. */
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
      <ListLayout
        title="Quotes"
        description="Every quote you have sent."
        actions={<Button>New quote</Button>}
        filters={
          <FilterGroup label="Status">
            <Button variant="outline" size="sm" pressed>
              All
            </Button>
            <Button variant="outline" size="sm" pressed={false}>
              Sent
            </Button>
            <Button variant="outline" size="sm" pressed={false}>
              Accepted
            </Button>
          </FilterGroup>
        }
      >
        <Card as="article">
          <Text strong>Naledi Mokoena</Text>
          <Text>Q-1042 · R 1 240 / mo</Text>
        </Card>
        <Card as="article">
          <Text strong>Pieter van Wyk</Text>
          <Text>Q-1041 · R 860 / mo</Text>
        </Card>
      </ListLayout>
    </AppShell>
  ),
};

export const WithRows: S = {
  render: () => (
    <DemoShell>
      <ListPage />
    </DemoShell>
  ),
};

/** With no children, the `empty` slot takes the list's place; the header and filters stay. */
export const Empty: S = {
  render: () => (
    <DemoShell>
      <ListPage isEmpty />
    </DemoShell>
  ),
};

/** `filters` sit under the header, then the rows: one `Card` per item. */
export const DoRows: S = {
  render: () => (
    <ListLayout
      title="Quotes"
      description="Every quote you have sent."
      actions={<Button>New quote</Button>}
      filters={
        <FilterGroup label="Status">
          <Button variant="outline" size="sm" pressed>
            All
          </Button>
          <Button variant="outline" size="sm" pressed={false}>
            Sent
          </Button>
        </FilterGroup>
      }
    >
      <Card as="article" title="Naledi Mokoena" status={<Pill tone="positive">Accepted</Pill>}>
        <Text>Q-1042 · R 1 240 / mo</Text>
      </Card>
      <Card as="article" title="Pieter van Wyk" status={<Pill tone="neutral">Sent</Pill>}>
        <Text>Q-1041 · R 860 / mo</Text>
      </Card>
    </ListLayout>
  ),
};

/** A one-off header and stack drifts from every other list page; `ListLayout` is the one header, filters and list. */
export const DontRows: S = {
  render: () => (
    <Stack>
      <PageHeader title="Quotes" description="Every quote you have sent." />
      <Card as="article" title="Naledi Mokoena">
        <Text>Q-1042 · R 1 240 / mo</Text>
      </Card>
    </Stack>
  ),
};

/** `empty` takes the list's place when there are no children: say what is missing and what to do. */
export const DoNothingYet: S = {
  render: () => (
    <ListLayout
      title="Quotes"
      description="Every quote you have sent."
      empty={
        <EmptyState title="No quotes yet" actions={<Button>New quote</Button>}>
          <Text>Quotes you send show up here.</Text>
        </EmptyState>
      }
    />
  ),
};

/** An empty list with no `empty` leaves a blank page under the header. */
export const DontNothingYet: S = {
  render: () => <ListLayout title="Quotes" description="Every quote you have sent." />,
};
