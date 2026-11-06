import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, Card, CardGrid, Pill, Text } from "@hackcove/ui-react";

/** Card's `titleStyle`, apart from Card.stories.tsx so each file stays short. */
const meta: Meta = { title: "Content/Card" };
export default meta;
type S = StoryObj;

/** `titleStyle="name"` sets the title as a name in sentence case, for a card of a shop, a listing or an event. Count, status, actions and `bar` work as with the overline. */
export const NameTitle: S = {
  render: () => (
    <CardGrid columns={2}>
      <Card
        title="Corner Books"
        titleStyle="name"
        status={<Pill tone="emerald">Open</Pill>}
        footer={<Button size="sm">Visit</Button>}
      >
        <Text as="p" color="muted">
          Second-hand paperbacks and a reading corner.
        </Text>
      </Card>
      <Card
        title="Spring swap meet"
        titleStyle="name"
        count={12}
        bar
        actions={<Button size="sm">Join</Button>}
      >
        <Text as="p" color="muted">
          Saturday, 10:00 at the town hall.
        </Text>
      </Card>
    </CardGrid>
  ),
};
