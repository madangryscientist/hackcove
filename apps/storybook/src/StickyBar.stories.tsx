import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, Card, Cluster, Input, Stack, StickyBar, Text } from "@hackcove/ui";
import { DemoShell, layoutPage } from "./layout/DemoShell";

const meta: Meta = { title: "UI/StickyBar", parameters: { bare: true }, beforeEach: layoutPage };
export default meta;
type S = StoryObj;

const filters = (
  <Cluster justify="between">
    <Input aria-label="Filter builds" placeholder="Filter builds" width="auto" />
    <Button size="sm" variant="outline">
      Accept all
    </Button>
  </Cluster>
);

const rows = Array.from({ length: 40 }, (_, index) => (
  <Text key={index} as="p">
    Build {40 - index}
  </Text>
));

/** A bar at the top of an `AppShell bleed` page: it spans the page and sticks under the header as the page scrolls. */
export const Default: S = {
  render: () => (
    <DemoShell bleed>
      <StickyBar>{filters}</StickyBar>
      <div className="px-4 py-4 sm:px-6">
        <Stack gap="sm">{rows}</Stack>
      </div>
    </DemoShell>
  ),
};

/** The page's filters and its bulk action go in one `StickyBar`, so they stay in reach under the header as the list scrolls. */
export const DoBar: S = {
  render: () => (
    <StickyBar>
      <Cluster justify="between">
        <Input aria-label="Filter builds" placeholder="Filter builds" width="auto" />
        <Button size="sm" variant="outline">
          Accept all
        </Button>
      </Cluster>
    </StickyBar>
  ),
};

/** Filters in a `Card` at the top of the page scroll away with it, so the action is out of reach halfway down a long list. Use `StickyBar`. */
export const DontBar: S = {
  render: () => (
    <Card>
      <Cluster justify="between">
        <Input aria-label="Filter builds" placeholder="Filter builds" width="auto" />
        <Button size="sm" variant="outline">
          Accept all
        </Button>
      </Cluster>
    </Card>
  ),
};
