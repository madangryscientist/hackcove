import type { Meta, StoryObj } from "@storybook/react-vite";
import { Card, CardGrid, Empty, Pill } from "@hackcove/ui";

/** Card's `badge` and `attention`, apart from Card.stories.tsx so each file stays short. */
const meta: Meta = { title: "UI/CardBadge" };
export default meta;
type S = StoryObj;

/** `badge` pins a Pill to the top-right corner over the content, on a panel and on a link card; on a link card it is part of the link's name. */
export const Badge: S = {
  render: () => (
    <CardGrid>
      <Card title="Dashboard" badge={<Pill tone="sky">UI</Pill>}>
        <Empty>A panel with a badge.</Empty>
      </Card>
      <Card href="#shot-3" title="Settings" badge={<Pill tone="amber">Flaky</Pill>}>
        <Empty>A link card with a badge.</Empty>
      </Card>
    </CardGrid>
  ),
};

/** `attention` draws the strong warn edge round a card that needs a look, on its own or with `tone="warn"`. */
export const Attention: S = {
  render: () => (
    <CardGrid columns={2}>
      <Card title="Flaky" attention>
        <Empty>Three shots changed on a rerun.</Empty>
      </Card>
      <Card title="Flaky" tone="warn" attention>
        <Empty>The same, on the warn surface.</Empty>
      </Card>
    </CardGrid>
  ),
};
