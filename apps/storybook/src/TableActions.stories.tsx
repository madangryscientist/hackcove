import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@hackcove/ui";

const meta: Meta = { title: "UI/Table actions" };
export default meta;
type S = StoryObj;

/** A column with nothing to show in its head (a row's actions) takes `srLabel` in place of children: the name a screen reader hears, visually hidden. */
export const ActionsColumn: S = {
  render: () => (
    <Table caption="Clients">
      <TableHead>
        <TableRow>
          <TableHeaderCell>Client</TableHeaderCell>
          <TableHeaderCell align="end">Premium</TableHeaderCell>
          <TableHeaderCell align="end" srLabel="Actions" />
        </TableRow>
      </TableHead>
      <TableBody>
        {["Naledi Dlamini", "Pieter van Wyk"].map((client) => (
          <TableRow key={client}>
            <TableCell tone="strong">{client}</TableCell>
            <TableCell align="end" numeric>
              R 1 249.00
            </TableCell>
            <TableCell align="end">
              <Button variant="outline" size="sm">
                Open
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};
