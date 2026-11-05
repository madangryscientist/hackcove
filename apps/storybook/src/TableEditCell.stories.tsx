import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Button,
  Cluster,
  Input,
  Select,
  Table,
  TableBody,
  TableCell,
  TableEditCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@hackcove/ui-react";

const meta: Meta = { title: "Data/Table" };
export default meta;
type S = StoryObj;

const CATEGORIES = ["Groceries", "Eating out", "Transport"];

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

function NoteCell() {
  const [note, setNote] = useState("Weekly shop");
  return (
    <TableEditCell
      label="Edit note"
      renderEditor={(close) => (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const value = new FormData(event.currentTarget).get("note");
            if (typeof value === "string") setNote(value);
            close();
          }}
        >
          <Cluster>
            <Input aria-label="Note" name="note" size="sm" defaultValue={note} />
            <Button type="submit" size="sm">
              Save
            </Button>
          </Cluster>
        </form>
      )}
    >
      {note}
    </TableEditCell>
  );
}

/** `TableEditCell` shows a value as a button with a dotted underline; a click, Enter or Space opens `renderEditor` in the cell. The editor saves and calls `close`; Esc cancels. Both put the focus back on the value. */
export const InlineEdit: S = {
  render: () => (
    <Table caption="Transactions">
      <TableHead>
        <TableRow>
          <TableHeaderCell>Description</TableHeaderCell>
          <TableHeaderCell>Category</TableHeaderCell>
          <TableHeaderCell>Note</TableHeaderCell>
          <TableHeaderCell align="end">Amount</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell tone="strong">Woolworths</TableCell>
          <CategoryCell />
          <NoteCell />
          <TableCell align="end" numeric>
            R 349.00
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};
