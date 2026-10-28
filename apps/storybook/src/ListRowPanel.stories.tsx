import type { Meta, StoryObj } from "@storybook/react-vite";
import { FullBleedLayout, ListRow, Text } from "@hackcove/ui";

const meta: Meta = { title: "UI/ListRowPanel" };
export default meta;
type S = StoryObj;

/** `active` on a `FullBleedLayout` panel, a `bg-slate-50` surface: its fill is one step deeper, so it still shows. `selected` is the violet one. */
export const ActiveOnPanel: S = {
  render: () => (
    <FullBleedLayout
      padded
      panel={
        <div>
          <ListRow size="sm" trailing="2">
            Missing part
          </ListRow>
          <ListRow size="sm" divided active trailing="1">
            Raw colour
          </ListRow>
          <ListRow size="sm" divided selected trailing="4">
            Local one-off
          </ListRow>
          <ListRow size="sm" divided trailing="3">
            Custom spacing
          </ListRow>
        </div>
      }
    >
      <Text>The shot under review.</Text>
    </FullBleedLayout>
  ),
};
