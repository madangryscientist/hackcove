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
} from "@hackcove/ui";
import { DemoShell, layoutPage } from "./DemoShell";
import { ListPage } from "./pages";

/** Every story under `Layout/` is picked up by the no-jump e2e at 375, 768 and 1280. */
const meta: Meta = {
  title: "Layout/ListLayout",
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
          variant="pill"
          label="Main"
          items={[
            { label: "Quotes", href: "#quotes", active: true },
            { label: "Clients", href: "#clients" },
          ]}
        />
      }
    >
      <ListLayout
        title="Quotes"
        subtitle="Every quote you have sent."
        actions={<Button>New quote</Button>}
        filters={
          <FilterGroup legend="Status">
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
          <Text strong as="p">
            Naledi Mokoena
          </Text>
          <Text as="p" color="secondary">
            Q-1042 · R 1 240 / mo
          </Text>
        </Card>
        <Card as="article">
          <Text strong as="p">
            Pieter van Wyk
          </Text>
          <Text as="p" color="secondary">
            Q-1041 · R 860 / mo
          </Text>
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

/** `isEmpty` swaps the list for the `empty` slot; the header and filters stay. */
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
      subtitle="Every quote you have sent."
      actions={<Button>New quote</Button>}
      filters={
        <FilterGroup legend="Status">
          <Button variant="outline" size="sm" pressed>
            All
          </Button>
          <Button variant="outline" size="sm" pressed={false}>
            Sent
          </Button>
        </FilterGroup>
      }
    >
      <Card as="article" title="Naledi Mokoena" status={<Pill tone="emerald">Accepted</Pill>}>
        <Text as="p">Q-1042 · R 1 240 / mo</Text>
      </Card>
      <Card as="article" title="Pieter van Wyk" status={<Pill tone="slate">Sent</Pill>}>
        <Text as="p">Q-1041 · R 860 / mo</Text>
      </Card>
    </ListLayout>
  ),
};

/** A one-off header and stack drifts from every other list page; `ListLayout` is the one header, filters and list. */
export const DontRows: S = {
  render: () => (
    <Stack>
      <PageHeader title="Quotes" subtitle="Every quote you have sent." />
      <Card as="article" title="Naledi Mokoena">
        <Text as="p">Q-1042 · R 1 240 / mo</Text>
      </Card>
    </Stack>
  ),
};

/** `empty` takes the list's place when `isEmpty`: say what is missing and what to do. */
export const DoNothingYet: S = {
  render: () => (
    <ListLayout
      title="Quotes"
      subtitle="Every quote you have sent."
      isEmpty
      empty={
        <EmptyState title="No quotes yet" actions={<Button>New quote</Button>}>
          <Text as="p" color="secondary">
            Quotes you send show up here.
          </Text>
        </EmptyState>
      }
    />
  ),
};

/** `isEmpty` without `empty` leaves a blank page under the header. */
export const DontNothingYet: S = {
  render: () => <ListLayout title="Quotes" subtitle="Every quote you have sent." isEmpty />,
};
