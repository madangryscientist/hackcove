import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  type TableSort,
} from "@slashsuite/ui-react";

const meta: Meta = { title: "Data/Table" };
export default meta;
type S = StoryObj;

/** Give the header `sort` and `onSort`, sort the rows yourself and pass the direction back: the title becomes a button and the column says where it stands. */
export const DoSort: S = {
  render: () => {
    const [sort, setSort] = useState<TableSort>("none");
    const quotes = [
      { ref: "Q-1043", total: 18400 },
      { ref: "Q-1044", total: 2350 },
      { ref: "Q-1045", total: 9100 },
    ];
    const rows =
      sort === "none"
        ? quotes
        : quotes.toSorted((a, b) => (sort === "ascending" ? a.total - b.total : b.total - a.total));
    return (
      <Table label="Quotes">
        <TableHead>
          <TableRow>
            <TableHeaderCell>Quote</TableHeaderCell>
            <TableHeaderCell numeric sort={sort} onSort={setSort}>
              Total
            </TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((quote) => (
            <TableRow key={quote.ref}>
              <TableCell>{quote.ref}</TableCell>
              <TableCell>R {quote.total}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  },
};

/** A button put in a header cell by hand says nothing about the order to a screen reader, and looks unlike every other sortable column. */
export const DontSort: S = {
  render: () => (
    <Table label="Quotes">
      <TableHead>
        <TableRow>
          <TableHeaderCell>Quote</TableHeaderCell>
          <TableHeaderCell numeric>
            <Button variant="ghost" size="sm">
              Total
            </Button>
          </TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell>Q-1043</TableCell>
          <TableCell>R 18400</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};
