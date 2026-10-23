import type { Meta, StoryObj } from "@storybook/react-vite";
import { PageHeader } from "@hackcove/ui";
import { DemoShell, layoutPage } from "./DemoShell";
import { StatTiles } from "./pages";

/** One column on a phone, two from `sm`, `columns` from `lg`. */
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
