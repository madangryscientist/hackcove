import type { Meta, StoryObj } from "@storybook/react-vite";
import { Card, CardGrid, PageHeader } from "@hackcove/ui";
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
