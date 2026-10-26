import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Pill,
  Table,
  TableBody,
  TableCell,
  TableFoot,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@hackcove/ui";

const meta: Meta = { title: "UI/Table do and don't" };
export default meta;
type S = StoryObj;

/** A table is a head and a body: names in strong cells, amounts in `align="end" numeric` cells so the figures line up. */
export const DoRecords: S = {
  render: () => (
    <Table caption="Quotes">
      <TableHead>
        <TableRow>
          <TableHeaderCell>Client</TableHeaderCell>
          <TableHeaderCell align="end">Premium</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell tone="strong">Naledi Dlamini</TableCell>
          <TableCell align="end" numeric>
            R 1 249.00
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell tone="strong">Pieter van Wyk</TableCell>
          <TableCell align="end" numeric>
            R 880.50
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};

/** Amounts in plain start-aligned cells do not line up, so the eye cannot compare them. */
export const DontRecords: S = {
  render: () => (
    <Table caption="Quotes">
      <TableHead>
        <TableRow>
          <TableHeaderCell>Client</TableHeaderCell>
          <TableHeaderCell>Premium</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell>Naledi Dlamini</TableCell>
          <TableCell>R 1 249.00</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Pieter van Wyk</TableCell>
          <TableCell>R 880.50</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};

/** Totals go in a `TableFoot` after the body: strong cells and a firmer line above them. */
export const DoTotals: S = {
  render: () => (
    <Table caption="Budget">
      <TableHead>
        <TableRow>
          <TableHeaderCell>Line</TableHeaderCell>
          <TableHeaderCell align="end">Spent</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
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
      </TableBody>
      <TableFoot>
        <TableRow>
          <TableCell>Total</TableCell>
          <TableCell align="end" numeric>
            R 7 100.00
          </TableCell>
        </TableRow>
      </TableFoot>
    </Table>
  ),
};

/** A total faked as one more body row, in a strong cell, reads like a line item and is not a `<tfoot>`. */
export const DontTotals: S = {
  render: () => (
    <Table caption="Budget">
      <TableHead>
        <TableRow>
          <TableHeaderCell>Line</TableHeaderCell>
          <TableHeaderCell align="end">Spent</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
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
        <TableRow>
          <TableCell tone="strong">Total</TableCell>
          <TableCell align="end" numeric tone="strong">
            R 7 100.00
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};

/** `tone` marks the row's status with a stripe and a soft fill, and a `Pill` in a cell names the status in words. */
export const DoRowStatus: S = {
  render: () => (
    <Table caption="Debit orders">
      <TableHead>
        <TableRow>
          <TableHeaderCell>Debit order</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
          <TableHeaderCell align="end">Amount</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell tone="strong">Insurance</TableCell>
          <TableCell>Paid</TableCell>
          <TableCell align="end" numeric>
            R 1 850.00
          </TableCell>
        </TableRow>
        <TableRow tone="danger">
          <TableCell tone="strong">Gym</TableCell>
          <TableCell>
            <Pill tone="red">Failed</Pill>
          </TableCell>
          <TableCell align="end" numeric>
            R 349.00
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};

/** A toned row whose cells never say what the tone means: colour alone tells nobody who cannot see it. */
export const DontRowStatus: S = {
  render: () => (
    <Table caption="Debit orders">
      <TableHead>
        <TableRow>
          <TableHeaderCell>Debit order</TableHeaderCell>
          <TableHeaderCell align="end">Amount</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell tone="strong">Insurance</TableCell>
          <TableCell align="end" numeric>
            R 1 850.00
          </TableCell>
        </TableRow>
        <TableRow tone="danger">
          <TableCell tone="strong">Gym</TableCell>
          <TableCell align="end" numeric>
            R 349.00
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};
