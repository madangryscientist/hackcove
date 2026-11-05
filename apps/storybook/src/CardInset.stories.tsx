import type { Meta, StoryObj } from "@storybook/react-vite";
import { Card, ProgressBar, Text } from "@hackcove/ui-react";

/** Card's `inset` and the nested neutral card, apart from Card.stories.tsx so each file stays short. */
const meta: Meta = { title: "Content/Card" };
export default meta;
type S = StoryObj;

/** `inset` is a band that runs edge to edge across the padded card, between the title and the body: a `ProgressBar` that fills the card's width. */
export const Inset: S = {
  render: () => (
    <div className="flex max-w-md flex-col gap-4">
      <Card title="Kitchen" inset={<ProgressBar value={62} label="Kitchen progress" />}>
        <Text as="p" color="muted">
          62% done, R 84 000 of R 135 000 spent.
        </Text>
      </Card>
      <Card size="sm" title="Bathroom" inset={<ProgressBar value={20} label="Bathroom progress" />}>
        <Text as="p" color="muted">
          Dense padding: the band follows it.
        </Text>
      </Card>
    </div>
  ),
};

/** A bordered sub-card inside a card is a `Card tone="neutral"`: a sunken, soft-bordered panel with no shadow. */
export const NestedNeutral: S = {
  render: () => (
    <div className="max-w-md">
      <Card title="Order 1042">
        <Card tone="neutral" size="sm">
          <Text as="p">Deliver to the back gate, after 14:00.</Text>
        </Card>
      </Card>
    </div>
  ),
};
