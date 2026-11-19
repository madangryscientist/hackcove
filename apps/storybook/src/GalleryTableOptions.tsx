import { useState } from "react";
import {
  EmptyState,
  InlineEdit,
  Pill,
  Select,
  Table,
  TableBody,
  TableCell,
  TableEditCell,
  TableExpandCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@slashsuite/ui-react";

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
          items={CATEGORIES.map((name) => ({ value: name, label: name }))}
        />
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
            items={CATEGORIES.map((name) => ({ value: name, label: name }))}
          />
        )}
      >
        {category}
      </InlineEdit>
      <Pill tone="warn" dot>
        Needs a receipt
      </Pill>
    </TableCell>
  );
}

/** A small table with a sorted column, the selected row, an open row with its `span="full"` panel, and an empty body. */
function GalleryTableStates() {
  const [open, setOpen] = useState(true);
  return (
    <>
      <Table label="Quotes, sorted" size="sm">
        <TableHead>
          <TableRow>
            <TableHeaderCell label="Details" />
            <TableHeaderCell>Quote</TableHeaderCell>
            <TableHeaderCell numeric sort="descending" onSort={() => undefined}>
              Total
            </TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow selected>
            <TableExpandCell
              expanded={open}
              label="Details"
              count={2}
              onClick={() => setOpen(!open)}
            />
            <TableCell>Q-1043</TableCell>
            <TableCell>R 18 400</TableCell>
          </TableRow>
          {open && (
            <TableRow>
              <TableCell span="full" tone="muted">
                Paint, brushes
              </TableCell>
            </TableRow>
          )}
          <TableRow>
            <TableExpandCell expanded={false} label="Details" onClick={() => undefined} />
            <TableCell>Q-1044</TableCell>
            <TableCell>R 2 350</TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <Table label="Quotes, none yet">
        <TableHead>
          <TableRow>
            <TableHeaderCell>Quote</TableHeaderCell>
            <TableHeaderCell numeric>Total</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody empty={<EmptyState title="No quotes yet." />}>{[]}</TableBody>
      </Table>
    </>
  );
}

/** A Table's indented lines, a `TableEditCell`, an `InlineEdit` in a cell with other content, an `emphasis` subtotal and a centred `colSpan` note; then the table states. */
export function GalleryTableOptions() {
  return (
    <>
      <GalleryTableStates />
      <Table label="Forecast">
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
            <TableCell numeric>R 349.00</TableCell>
          </TableRow>
          <TableRow>
            <TableCell indent={1}>Engen</TableCell>
            <CategoryInCell />
            <TableCell numeric>R 880.00</TableCell>
          </TableRow>
          <TableRow emphasis>
            <TableCell>Subtotal</TableCell>
            <TableCell>Home</TableCell>
            <TableCell numeric>R 1 229.00</TableCell>
          </TableRow>
          <TableRow>
            <TableCell colSpan={3} align="center" tone="muted">
              Nothing else this month.
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </>
  );
}
