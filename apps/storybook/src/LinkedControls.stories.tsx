import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import {
  Button,
  Card,
  CardGrid,
  Cluster,
  ListRow,
  Pill,
  TextLink,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Text,
} from "@slashsuite/ui-react";

const meta: Meta = { title: "Data/ListRow" };
export default meta;
type S = StoryObj;

/** A link and a button in a link row sit above the row's link and take their own click; a click anywhere else on the row still follows it. Put several in `trailing` inside a `Cluster`, which spaces them (`actions` is for a row with no `href` and no `onClick`). */
export const ListRowWithControls: S = {
  render: () => (
    <div className="max-w-md">
      <Card flush>
        <ListRow
          href="#grace"
          trailing={
            <Cluster as="span">
              <TextLink href="#grace-notes">Notes</TextLink>
              <Button size="sm">Accept</Button>
            </Cluster>
          }
        >
          Grace Hopper
        </ListRow>
        <ListRow divided href="#ada" trailing={<Pill tone="warn">pending</Pill>}>
          Ada Lovelace
        </ListRow>
      </Card>
    </div>
  ),
};

const shops = ["Grace", "Ada"];

function SelectingRows() {
  const [selected, setSelected] = useState<string | undefined>(undefined);
  return (
    <Stack>
      <Card flush>
        {shops.map((shop, index) => (
          <ListRow
            key={shop}
            divided={index > 0}
            selected={selected === shop}
            onClick={() => setSelected(shop)}
            trailing={
              <Button size="sm" variant="outline" href={`/shop-${shop.toLowerCase()}`}>
                View
              </Button>
            }
          >
            {shop}
          </ListRow>
        ))}
      </Card>
      <Text tone="muted">Selected: {selected ?? "none"}</Text>
    </Stack>
  );
}

/** A button row can hold a link too: a tap on the row runs its `onClick` (here, selecting the shop), and the "View" link in `trailing` (drawn by the app's router link through `LinkProvider`) sits above the row's button and opens the shop's page on its own. */
export const ButtonRowWithLink: S = {
  render: () => (
    <div className="max-w-md">
      <SelectingRows />
    </div>
  ),
};

const quotes = [
  { ref: "Q-1042", client: "Naledi Dlamini" },
  { ref: "Q-1043", client: "Pieter van Wyk" },
];

/** A link and a button in a linked table row sit above the row's stretched `TextLink` and take their own click; the rest of the row still follows it. */
export const TableRowWithControls: S = {
  render: () => (
    <Table label="Quotes">
      <TableHead>
        <TableRow>
          <TableHeaderCell>Reference</TableHeaderCell>
          <TableHeaderCell>Client</TableHeaderCell>
          <TableHeaderCell align="end" label="Actions" />
        </TableRow>
      </TableHead>
      <TableBody>
        {quotes.map((q) => (
          <TableRow key={q.ref}>
            <TableCell mono>
              <TextLink href={`#${q.ref}`} stretch>
                {q.ref}
              </TextLink>
            </TableCell>
            <TableCell tone="strong">
              <TextLink href={`#${q.ref}-client`}>{q.client}</TextLink>
            </TableCell>
            <TableCell align="end">
              <Button size="sm" variant="outline">
                Resend
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

/** A link card can hold its own link and button: they sit above the card's link and take their own click, and a click anywhere else on the card still follows it. */
export const CardWithAction: S = {
  render: () => (
    <CardGrid>
      <Card href="#shot-1" title="Dashboard" status={<Pill tone="warn">changed</Pill>}>
        <Stack>
          <Text tone="muted">Open the diff for this shot.</Text>
          <TextLink href="#shot-1-history">History</TextLink>
          <Button size="sm" variant="outline">
            Accept
          </Button>
        </Stack>
      </Card>
    </CardGrid>
  ),
};
