import type { Meta, StoryObj } from "@storybook/react-vite";
import { Card, CardGrid, Pill, Text } from "@hackcove/ui-react";

/** Card's `icon`, apart from Card.stories.tsx so each file stays short. */
const meta: Meta = { title: "Content/Card" };
export default meta;
type S = StoryObj;

/** `icon` names one of the library's icons: it draws at feature size in the accent colour above the title, with no tile behind it and no styling from the consumer. */
export const Icon: S = {
  render: () => (
    <CardGrid columns={3}>
      <Card icon="diff" title="Visual diffs">
        <Text as="p" color="muted">
          Every changed pixel, side by side with the approved screenshot.
        </Text>
      </Card>
      <Card icon="review" title="Review" status={<Pill tone="emerald">New</Pill>}>
        <Text as="p" color="muted">
          Approve or reject each change from the pull request.
        </Text>
      </Card>
      <Card icon="self-host" title="Self-host">
        <Text as="p" color="muted">
          Runs on your own machine; nothing leaves it.
        </Text>
      </Card>
    </CardGrid>
  ),
};

/** `icon` sits in the card's padded body, so it follows `size`; on a link card the whole card is still the one link. */
export const IconSizes: S = {
  render: () => (
    <CardGrid columns={3} align="start">
      <Card icon="privacy" title="Privacy" size="sm">
        <Text as="p" color="muted">
          Dense.
        </Text>
      </Card>
      <Card icon="ci" title="CI" href="#ci">
        <Text as="p" color="muted">
          A link card.
        </Text>
      </Card>
      <Card icon="baseline" title="Baseline" size="lg">
        <Text as="p" color="muted">
          Roomy.
        </Text>
      </Card>
    </CardGrid>
  ),
};
