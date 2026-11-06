import { useState } from "react";
import {
  InlineEdit,
  Pill,
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

function CategoryInCell() {
  const [category, setCategory] = useState("Transport");
  return (
    <TableCell>
      <InlineEdit
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
      </InlineEdit>
      <Pill tone="amber" dot>
        Needs a receipt
      </Pill>
    </TableCell>
  );
}

/** A Table's indented lines, a `TableEditCell`, an `InlineEdit` in a cell with other content, an `emphasis` subtotal and a centred `colSpan` note. */
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
        <TableRow>
          <TableCell indent={1}>Engen</TableCell>
          <CategoryInCell />
          <TableCell align="end" numeric>
            R 880.00
          </TableCell>
        </TableRow>
        <TableRow emphasis>
          <TableCell>Subtotal</TableCell>
          <TableCell>Home</TableCell>
          <TableCell align="end" numeric>
            R 1 229.00
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
