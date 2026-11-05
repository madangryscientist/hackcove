import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Avatar, Button, Caption, Card, FullBleedLayout, ListRow, Text } from "@hackcove/ui-react";

const meta: Meta = { title: "Data/ListRow" };
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

/**
 * `detail` is content under a `static` row that starts where its label does, past `leading`: a row
 * that opens in place. The line above the row (`divided`) and the hover fill cover the detail too,
 * so a list of them is `divided={index > 0}` on each.
 */
export const StaticDetail: S = {
  render: function Render() {
    const chats = [
      { name: "Ada Lovelace", last: "The engine is ready for Tuesday." },
      { name: "Grace Hopper", last: "Found the moth." },
      { name: "Linus T", last: "Merged." },
    ];
    const [open, setOpen] = useState<string | null>("Ada Lovelace");
    return (
      <div className="max-w-xl">
        <Card flush>
          {chats.map((chat, index) => (
            <ListRow
              key={chat.name}
              static
              divided={index > 0}
              leading={<Avatar name={chat.name} />}
              trailing="10:42"
              actions={
                <Button
                  size="sm"
                  variant="outline"
                  aria-expanded={open === chat.name}
                  onClick={() => setOpen(open === chat.name ? null : chat.name)}
                >
                  {open === chat.name ? "Close" : "Open"}
                </Button>
              }
              detail={open === chat.name && <Text as="p">Thread with {chat.name} opens here.</Text>}
            >
              <Text strong>{chat.name}</Text>
              <Caption as="p">{chat.last}</Caption>
            </ListRow>
          ))}
        </Card>
      </div>
    );
  },
};
