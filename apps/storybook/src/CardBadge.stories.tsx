import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Button,
  Card,
  CardGrid,
  Cluster,
  Input,
  Pill,
  Stack,
  StickyBar,
  Text,
  TextLink,
} from "@hackcove/ui-react";
import { DemoShell, layoutPage } from "./layout/DemoShell";

/** Card's `badge` and `attention`, apart from Card.stories.tsx so each file stays short. */
const meta: Meta = { title: "Content/Card" };
export default meta;
type S = StoryObj;

/** `badge` pins a Pill to the top-right corner over the content, on a panel and on a link card; on a link card it is part of the link's name. */
export const Badge: S = {
  render: () => (
    <CardGrid>
      <Card title="Dashboard" badge={<Pill tone="sky">UI</Pill>}>
        <Text as="p" color="muted">
          A panel with a badge.
        </Text>
      </Card>
      <Card href="#shot-3" title="Settings" badge={<Pill tone="amber">Flaky</Pill>}>
        <Text as="p" color="muted">
          A link card with a badge.
        </Text>
      </Card>
    </CardGrid>
  ),
};

/** `attention` draws the strong warn edge round a card that needs a look, on its own or with `tone="warn"`. */
export const Attention: S = {
  render: () => (
    <CardGrid columns={2}>
      <Card title="Flaky" attention>
        <Text as="p" color="muted">
          Three shots changed on a rerun.
        </Text>
      </Card>
      <Card title="Flaky" tone="warn" attention>
        <Text as="p" color="muted">
          The same, on the warn surface.
        </Text>
      </Card>
    </CardGrid>
  ),
};

const filters = (
  <Cluster justify="between">
    <Input aria-label="Filter builds" placeholder="Filter builds" width="auto" />
    <Button size="sm" variant="outline">
      Accept all
    </Button>
  </Cluster>
);

const builds = Array.from({ length: 40 }, (_, index) => (
  <Text key={index} as="p">
    Build {40 - index}
  </Text>
));

/**
 * A link card with its own link, button and badge link, on a page that scrolls under AppShell's
 * header and a StickyBar: the bars stay on top where they overlap the card, and the card's own
 * controls are still clickable on their own while the rest of the card follows the link.
 */
export const UnderStickyBars: S = {
  parameters: { bare: true },
  beforeEach: layoutPage,
  render: () => (
    <DemoShell bleed>
      <StickyBar data-testid="sticky-bar">{filters}</StickyBar>
      <div className="px-4 py-4 sm:px-6">
        <Stack gap="sm">
          <Card href="#build-41" title="Build 41" badge={<TextLink href="#flaky">Flaky</TextLink>}>
            <Text as="p" color="muted">
              Open the build to review its shots.
            </Text>
            <Cluster>
              <TextLink href="#open">Open the build</TextLink>
              <Button size="sm" variant="outline">
                Accept
              </Button>
            </Cluster>
          </Card>
          {builds}
        </Stack>
      </div>
    </DemoShell>
  ),
};
