import type { Meta, StoryObj } from "@storybook/react-vite";
import { Body, Card, NavTabs, PageHeader, Stack } from "@hackcove/ui";
import { DemoShell, layoutPage } from "./DemoShell";

/** Every story under `Layout/` is picked up by the no-jump e2e (e2e/layout.spec.ts) at 375, 768 and 1280. */
const meta: Meta = {
  title: "Layout/AppShell",
  parameters: { bare: true },
  beforeEach: layoutPage,
};
export default meta;
type S = StoryObj;

const subnav = (
  <NavTabs
    label="Project"
    items={["Latest", "Branches", "Baselines", "Flaky", "Ignore boxes", "Audit"].map(
      (label, i) => ({
        label,
        href: `#${label}`,
        active: i === 0,
      }),
    )}
  />
);

/** Taller than the viewport: the header stays put while main scrolls. */
export const LongPage: S = {
  render: () => (
    <DemoShell subnav={subnav} footer="Hack Cove · MIT">
      <PageHeader title="Builds" subtitle="Every build of every branch." />
      <Stack>
        {Array.from({ length: 12 }, (_, i) => (
          <Card key={i} title={`Build ${12 - i}`}>
            <Body>Captured 48 stories in 4 themes.</Body>
          </Card>
        ))}
      </Stack>
    </DemoShell>
  ),
};

/** Shorter than the viewport: the title starts at the same x as on the long page. */
export const ShortPage: S = {
  render: () => (
    <DemoShell>
      <PageHeader title="About" />
      <Body as="p">One short paragraph.</Body>
    </DemoShell>
  ),
};
