import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Stack,
  Table,
  TableBody,
  TableCell,
  TableFoot,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@hackcove/ui-react";

const meta: Meta = { title: "Data/Table" };
export default meta;
type S = StoryObj;

/** `align="center"` centres a cell's content: here a `colSpan` empty state and a centred column. A `truncate` cell's box follows the alignment. */
export const CentredCells: S = {
  render: () => (
    <Stack gap="md">
      <Table caption="Transactions">
        <TableHead>
          <TableRow>
            <TableHeaderCell>Date</TableHeaderCell>
            <TableHeaderCell>Description</TableHeaderCell>
            <TableHeaderCell align="end">Amount</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell colSpan={3} align="center" tone="muted">
              No transactions this month.
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <Table caption="Equipment">
        <TableHead>
          <TableRow>
            <TableHeaderCell>Item</TableHeaderCell>
            <TableHeaderCell align="center">Quantity</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell tone="strong">Laptop</TableCell>
            <TableCell align="center" numeric>
              2
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell tone="strong">Monitor</TableCell>
            <TableCell align="center" numeric>
              14
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell tone="strong">Serial numbers</TableCell>
            <TableCell align="center" truncate>
              SN-2041-88213, SN-2041-88214, SN-2041-88215, SN-2041-88216, SN-2041-88217
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Stack>
  ),
};

/** `indent` sets a start-aligned cell in by 1, 2 or 3 levels, for the lines under a parent row. */
export const Indent: S = {
  render: () => (
    <Table caption="Forecast">
      <TableHead>
        <TableRow>
          <TableHeaderCell>Line</TableHeaderCell>
          <TableHeaderCell align="end">November</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell tone="strong">Expenses</TableCell>
          <TableCell align="end" numeric>
            R 9 450.00
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell indent={1}>Home</TableCell>
          <TableCell align="end" numeric>
            R 7 100.00
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell indent={2}>Groceries</TableCell>
          <TableCell align="end" numeric>
            R 4 120.00
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell indent={3}>Delivery fees</TableCell>
          <TableCell align="end" numeric>
            R 180.00
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell indent={1}>Fun</TableCell>
          <TableCell align="end" numeric>
            R 2 350.00
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};

/** `emphasis` is a subtotal among a body's rows, in a `TableFoot` row's look: strong cells, a firmer line above and no hover. The total of the whole table stays in `TableFoot`. */
export const EmphasisRow: S = {
  render: () => (
    <Table caption="Forecast">
      <TableHead>
        <TableRow>
          <TableHeaderCell>Line</TableHeaderCell>
          <TableHeaderCell align="end">November</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell>Salary</TableCell>
          <TableCell align="end" numeric>
            R 38 000.00
          </TableCell>
        </TableRow>
        <TableRow emphasis>
          <TableCell>Total income</TableCell>
          <TableCell align="end" numeric>
            R 38 000.00
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Groceries</TableCell>
          <TableCell align="end" numeric>
            R 4 120.00
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Eating out</TableCell>
          <TableCell align="end" numeric>
            R 2 980.00
          </TableCell>
        </TableRow>
        <TableRow emphasis>
          <TableCell>Total expenses</TableCell>
          <TableCell align="end" numeric tone="danger">
            R 7 100.00
          </TableCell>
        </TableRow>
      </TableBody>
      <TableFoot>
        <TableRow>
          <TableCell>Left over</TableCell>
          <TableCell align="end" numeric>
            R 30 900.00
          </TableCell>
        </TableRow>
      </TableFoot>
    </Table>
  ),
};
