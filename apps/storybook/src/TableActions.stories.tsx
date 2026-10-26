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

/** A row's actions get a column of their own whose head has an `srLabel`: the head keeps its column and a screen reader hears "Actions". */
export const DoActionsColumn: S = {
  render: () => (
    <Table caption="Clients">
      <TableHead>
        <TableRow>
          <TableHeaderCell>Client</TableHeaderCell>
          <TableHeaderCell align="end" srLabel="Actions" />
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell tone="strong">Naledi Dlamini</TableCell>
          <TableCell align="end">
            <Button variant="outline" size="sm">
              Open
            </Button>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};

/** An empty header cell leaves the column with no name, so a screen reader hears a column of unlabelled buttons. */
export const DontActionsColumn: S = {
  render: () => (
    <Table caption="Clients">
      <TableHead>
        <TableRow>
          <TableHeaderCell>Client</TableHeaderCell>
          <TableHeaderCell align="end" />
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell tone="strong">Naledi Dlamini</TableCell>
          <TableCell align="end">
            <Button variant="outline" size="sm">
              Open
            </Button>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};
