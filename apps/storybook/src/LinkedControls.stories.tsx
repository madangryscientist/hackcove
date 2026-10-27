import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Button,
  Card,
  CardGrid,
  Empty,
  ListRow,
  Pill,
  rowLinkClass,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  TextLink,
} from "@hackcove/ui";

const meta: Meta = { title: "UI/Linked controls" };
export default meta;
type S = StoryObj;

/** A link and a button in a link row sit above the row's link and take their own click; a click anywhere else on the row still follows it. */
export const ListRowWithControls: S = {
  render: () => (
    <div className="max-w-md">
      <Card flush>
        <ListRow
          href="#grace"
          trailing={
            <>
              <TextLink href="#grace-notes">Notes</TextLink>
              <Button size="sm">Accept</Button>
            </>
          }
        >
          Grace Hopper
        </ListRow>
        <ListRow divided href="#ada" trailing={<Pill tone="amber">pending</Pill>}>
          Ada Lovelace
        </ListRow>
      </Card>
    </div>
  ),
};

const quotes = [
  { ref: "Q-1042", client: "Naledi Dlamini" },
  { ref: "Q-1043", client: "Pieter van Wyk" },
];

/** A link and a button in a linked table row sit above the row's `rowLinkClass` link and take their own click; the rest of the row still follows it. */
export const TableRowWithControls: S = {
  render: () => (
    <Table caption="Quotes">
      <TableHead>
        <TableRow>
          <TableHeaderCell>Reference</TableHeaderCell>
          <TableHeaderCell>Client</TableHeaderCell>
          <TableHeaderCell align="end" srLabel="Actions" />
        </TableRow>
      </TableHead>
      <TableBody>
        {quotes.map((q) => (
          <TableRow key={q.ref}>
            <TableCell mono>
              <a href={`#${q.ref}`} className={rowLinkClass}>
                {q.ref}
              </a>
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
      <Card href="#shot-1" title="Dashboard" status={<Pill tone="amber">changed</Pill>}>
        <Stack>
          <Empty>Open the diff for this shot.</Empty>
          <TextLink href="#shot-1-history">History</TextLink>
          <Button size="sm" variant="outline">
            Accept
          </Button>
        </Stack>
      </Card>
    </CardGrid>
  ),
};
