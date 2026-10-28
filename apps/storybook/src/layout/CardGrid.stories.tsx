import type { Meta, StoryObj } from "@storybook/react-vite";
import { AppShell, Card, CardGrid, Tabs, PageHeader, Stack, StatTile, Text } from "@hackcove/ui";
import { DemoShell, layoutPage } from "./DemoShell";
import { StatTiles } from "./pages";

/** One column on a phone, two from `sm`, `columns` from `lg`; `columns="auto"` fills by a minimum card width. */
const meta: Meta = {
  title: "Layout/CardGrid",
  parameters: { bare: true },
  beforeEach: layoutPage,
};
export default meta;
type S = StoryObj;

/** A whole dashboard page: the shell with its brand and nav, then a `PageHeader` and a `CardGrid` of tiles. */
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
      <Stack gap="xl">
        <PageHeader title="Business" subtitle="This month at a glance." />
        <CardGrid columns={3}>
          <StatTile label="Open" value="12" />
          <StatTile label="Won" value="8" tone="positive" />
          <StatTile label="Lost" value="3" tone="negative" />
        </CardGrid>
      </Stack>
    </AppShell>
  ),
};

export const FourColumns: S = {
  render: () => (
    <DemoShell>
      <PageHeader title="Business" subtitle="This month at a glance." />
      <StatTiles columns={4} />
    </DemoShell>
  ),
};

export const ThreeColumns: S = {
  render: () => (
    <DemoShell>
      <PageHeader title="Business" subtitle="This month at a glance." />
      <StatTiles columns={3} />
    </DemoShell>
  ),
};

export const TwoColumns: S = {
  render: () => (
    <DemoShell>
      <PageHeader title="Business" subtitle="This month at a glance." />
      <StatTiles columns={2} />
    </DemoShell>
  ),
};

const shots = [
  ["Dashboard", "One line."],
  [
    "Settings",
    "A longer note that wraps onto a couple of lines, so the cards beside it are different heights.",
  ],
  ["Billing", "Two short lines\nof text."],
  ["Members", "One line."],
  ["Audit log", "One line."],
] as const;

function Shots({ minWidth, align }: { minWidth?: "sm" | "md"; align?: "start" | "stretch" }) {
  return (
    <DemoShell>
      <PageHeader title="Shots" subtitle="As many per row as the width allows." />
      <CardGrid columns="auto" minWidth={minWidth} align={align}>
        {shots.map(([title, note]) => (
          <Card key={title} title={title}>
            <p className="text-sm text-slate-700">{note}</p>
          </Card>
        ))}
      </CardGrid>
    </DemoShell>
  );
}

/** `columns="auto"`: as many per row as fit, none narrower than `md` (17rem, the default). */
export const AutoFill: S = { render: () => <Shots /> };

/** `minWidth="sm"` (12rem) fits more, smaller cards per row. */
export const AutoFillSmall: S = { render: () => <Shots minWidth="sm" /> };

/** `align="start"` keeps each card its own height instead of stretching to the tallest in the row. */
export const AlignStart: S = { render: () => <Shots align="start" /> };

/** `as="ul"` makes the grid a list and each child a list item, for tiles that are a set of like things a screen reader should count. The look is the same. */
export const AsList: S = {
  render: () => (
    <DemoShell>
      <PageHeader title="Business" subtitle="This month at a glance." />
      <CardGrid as="ul" columns={3} aria-label="This month">
        <StatTile label="Open" value="12" />
        <StatTile label="Won" value="8" tone="positive" />
        <StatTile label="Lost" value="3" tone="negative" />
      </CardGrid>
    </DemoShell>
  ),
};

/** Tiles go in a `CardGrid`: one column on a phone, two from `sm`, `columns` from `lg`. */
export const DoTiles: S = {
  render: () => (
    <CardGrid columns={3}>
      <StatTile label="Open" value="12" />
      <StatTile label="Won" value="8" tone="positive" />
      <StatTile label="Lost" value="3" tone="negative" />
    </CardGrid>
  ),
};

/** A `Stack` is one column, so the tiles never sit side by side and the page runs long. Use a `CardGrid`. */
export const DontTiles: S = {
  render: () => (
    <Stack>
      <StatTile label="Open" value="12" />
      <StatTile label="Won" value="8" tone="positive" />
      <StatTile label="Lost" value="3" tone="negative" />
    </Stack>
  ),
};

/** For cards of any count, `columns="auto"` fits as many per row as the width allows. */
export const DoAuto: S = {
  render: () => (
    <CardGrid columns="auto" minWidth="sm" align="start">
      <Card title="Dashboard">
        <Text as="p">Quotes and renewals this week.</Text>
      </Card>
      <Card title="Billing">
        <Text as="p">Invoices and payments.</Text>
      </Card>
      <Card title="Members">
        <Text as="p">Who can sign in.</Text>
      </Card>
    </CardGrid>
  ),
};
