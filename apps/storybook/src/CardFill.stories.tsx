import type { Meta, StoryObj } from "@storybook/react-vite";
import { Card, ListRow, Stack, Text, TextLink } from "@hackcove/ui-react";

const meta: Meta = { title: "Content/Card" };
export default meta;
type S = StoryObj;

const shops = [
  "Second Chance",
  "The Attic",
  "Hospice Shop",
  "Rewind",
  "Old Things",
  "Pre-loved",
  "Thrift Lane",
  "Kiss and Tell",
  "Reclaim",
  "Box of Tricks",
  "Marlow Market",
  "Two Hands",
  "Odd Lot",
  "Good Bones",
  "Treasure Chest",
  "Back Again",
  "Slow Fashion",
  "Half Price",
  "Tin Roof",
  "Bric-a-brac",
];

/** `fill` takes the parent's full height: the bar stays put and the list scrolls inside the 400px box. */
export const Fill: S = {
  render: () => (
    <div className="h-100 max-w-md">
      <Card flush bar title="Shops nearby" count={shops.length} fill>
        {shops.map((shop, i) => (
          <ListRow key={shop} href={`#shop-${i}`} divided={i > 0} size="sm">
            {shop}
          </ListRow>
        ))}
      </Card>
    </div>
  ),
};

/** A plain `fill` card: the title stays put and the text scrolls under it. */
export const FillPlain: S = {
  render: () => (
    <div className="h-100 max-w-md">
      <Card title="Notes" fill>
        <Stack>
          {Array.from({ length: 8 }, (_, i) => (
            <Text key={i} as="p" color="muted">
              Shops open at nine on weekdays and close early on Saturdays. Most take cards, a few
              take cash only, and the market stalls change from week to week.
            </Text>
          ))}
          <Text as="p">
            Opening hours change over the holidays:{" "}
            <TextLink href="#hours">read the hours</TextLink>.
          </Text>
        </Stack>
      </Card>
    </div>
  ),
};
