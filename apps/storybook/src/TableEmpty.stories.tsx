import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  EmptyState,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@slashsuite/ui-react";

const meta: Meta = { title: "Data/Table" };
export default meta;
type S = StoryObj;

/** `TableBody empty` takes an `EmptyState` and spans it across every column the head declares. */
export const DoEmpty: S = {
  render: () => (
    <Table label="Quotes">
      <TableHead>
        <TableRow>
          <TableHeaderCell>Quote</TableHeaderCell>
          <TableHeaderCell>Customer</TableHeaderCell>
          <TableHeaderCell numeric>Total</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody empty={<EmptyState title="No quotes yet." />}>{[]}</TableBody>
    </Table>
  ),
};

/** A cell with a column count written by hand breaks the day a column is added, and is a second empty look. */
export const DontEmpty: S = {
  render: () => (
    <Table label="Quotes">
      <TableHead>
        <TableRow>
          <TableHeaderCell>Quote</TableHeaderCell>
          <TableHeaderCell>Customer</TableHeaderCell>
          <TableHeaderCell numeric>Total</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell colSpan={5} align="center" tone="muted">
            No quotes yet.
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};
