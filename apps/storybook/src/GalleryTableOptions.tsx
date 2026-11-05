import { useState } from "react";
import {
  Select,
  Table,
  TableBody,
  TableCell,
  TableEditCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@hackcove/ui-react";

const CATEGORIES = ["Groceries", "Transport"];

function CategoryCell() {
  const [category, setCategory] = useState("Groceries");
  return (
    <TableEditCell
      label="Edit category"
      renderEditor={(close) => (
        <Select
          aria-label="Category"
          size="sm"
          value={category}
          onChange={(event) => {
            setCategory(event.target.value);
            close();
          }}
        >
          {CATEGORIES.map((name) => (
            <option key={name}>{name}</option>
          ))}
        </Select>
      )}
    >
      {category}
    </TableEditCell>
  );
}

/** A Table's indented lines, an `emphasis` subtotal, a `TableEditCell` and a centred `colSpan` note. */
export function GalleryTableOptions() {
  return (
    <Table caption="Forecast">
      <TableHead>
        <TableRow>
          <TableHeaderCell>Line</TableHeaderCell>
          <TableHeaderCell>Category</TableHeaderCell>
          <TableHeaderCell align="end">November</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell indent={1}>Woolworths</TableCell>
          <CategoryCell />
          <TableCell align="end" numeric>
            R 349.00
          </TableCell>
        </TableRow>
        <TableRow emphasis>
          <TableCell>Subtotal</TableCell>
          <TableCell>Home</TableCell>
          <TableCell align="end" numeric>
            R 349.00
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell colSpan={3} align="center" tone="muted">
            Nothing else this month.
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
