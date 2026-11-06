import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  InlineEdit,
  Input,
  Pill,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@hackcove/ui-react";

const meta: Meta = { title: "Data/Table" };
export default meta;
type S = StoryObj;

const CATEGORIES = ["Groceries", "Eating out", "Transport"];

function CategoryInCell() {
  const [category, setCategory] = useState("Groceries");
  return (
    <TableCell secondary="Card ending 4417">
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
    </TableCell>
  );
}

/** `InlineEdit` is the edit trigger without the cell: put it in a `TableCell` that holds other content (a `secondary` line, a `Pill`). It behaves as `TableEditCell` does: a click, Enter or Space opens the editor and focuses it; Esc, a save's `close`, a press outside or Tab out closes it. */
export const InlineEditInCell: S = {
  render: () => (
    <Table caption="Transactions">
      <TableHead>
        <TableRow>
          <TableHeaderCell>Description</TableHeaderCell>
          <TableHeaderCell>Category</TableHeaderCell>
          <TableHeaderCell align="end">Amount</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell tone="strong">Woolworths</TableCell>
          <CategoryInCell />
          <TableCell align="end" numeric>
            R 349.00
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell tone="strong">Engen</TableCell>
          <TableCell>
            <InlineEdit
              label="Edit category"
              renderEditor={() => (
                <Input aria-label="Category" size="sm" defaultValue="Transport" />
              )}
            >
              Transport
            </InlineEdit>
            <Pill tone="amber" dot>
              Needs a receipt
            </Pill>
          </TableCell>
          <TableCell align="end" numeric>
            R 880.00
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};
