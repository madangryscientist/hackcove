import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  type CellTone,
  Card,
  EmptyState,
  Pill,
  TextLink,
  Table,
  TableBody,
  TableCell,
  TableFoot,
  TableGroupRow,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@hackcove/ui-react";

const meta: Meta = { title: "Data/Table" };
export default meta;
type S = StoryObj;

const quotes = [
  { ref: "Q-1042", client: "Naledi Dlamini", premium: "R 1 249.00", status: "sent" as const },
  { ref: "Q-1043", client: "Pieter van Wyk", premium: "R 880.50", status: "accepted" as const },
  { ref: "Q-1044", client: "Thandi Mokoena", premium: "R 2 310.00", status: "sent" as const },
];

function QuotesTable() {
  return (
    <Table label="Quotes">
      <TableHead>
        <TableRow>
          <TableHeaderCell>Reference</TableHeaderCell>
          <TableHeaderCell>Client</TableHeaderCell>
          <TableHeaderCell numeric>Premium</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {quotes.map((q) => (
          <TableRow key={q.ref}>
            <TableCell mono>
              <TextLink href={`#${q.ref}`} stretch>
                {q.ref}
              </TextLink>
            </TableCell>
            <TableCell tone="strong">{q.client}</TableCell>
            <TableCell numeric>{q.premium}</TableCell>
            <TableCell tone="muted">
              <Pill tone={q.status === "accepted" ? "positive" : "warn"}>{q.status}</Pill>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

/** The whole row is the click target: the reference link stretches over it. */
export const Quotes: S = { render: () => <QuotesTable /> };

/** Narrow: the card scrolls sideways rather than squeezing the columns. */
/** A table with no rows: `TableBody empty` draws one muted line across every column, under the head. */
export const Empty: S = {
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

export const Narrow: S = {
  render: () => (
    <div className="max-w-xs">
      <QuotesTable />
    </div>
  ),
};

/** Inside a `Card` a Table is plain: no card, no header strip, no row hover; only the row dividers. */
export const Plain: S = {
  render: () => (
    <Card title="Quotes">
      <Table label="Quotes">
        <TableHead>
          <TableRow>
            <TableHeaderCell>Client</TableHeaderCell>
            <TableHeaderCell numeric>Premium</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {quotes.map((q) => (
            <TableRow key={q.ref}>
              <TableCell tone="strong">{q.client}</TableCell>
              <TableCell numeric>{q.premium}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  ),
};

/** `secondary` is a second, muted line under the main content of a cell. */
export const SecondLine: S = {
  render: () => (
    <Table label="Clients">
      <TableHead>
        <TableRow>
          <TableHeaderCell>Client</TableHeaderCell>
          <TableHeaderCell numeric>Premium</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {quotes.map((q) => (
          <TableRow key={q.ref} data-ref={q.ref}>
            <TableCell tone="strong" secondary={q.ref}>
              {q.client}
            </TableCell>
            <TableCell numeric secondary="per month">
              {q.premium}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

const lines = [
  { name: "Groceries", spent: "R 4 120.00", tone: undefined },
  { name: "Eating out", spent: "R 2 980.00", tone: "danger" as const },
  { name: "Card payment", spent: "R 1 500.00", tone: "muted" as const },
  { name: "Unmatched debit order", spent: "R 349.00", tone: "warn" as const },
  { name: "Salary", spent: "R 38 000.00", tone: "positive" as const },
  { name: "Note from the bank", spent: "R 0.00", tone: "info" as const },
  { name: "Rounding", spent: "R 0.01", tone: "neutral" as const },
];

/** `tone` on a row marks its state with a stripe on the leading edge and a soft fill: the Callout tones, plus `muted` to fade a row that is not the point (a transfer). No class, no style. */
export const RowTones: S = {
  render: () => (
    <Table label="Budget">
      <TableHead>
        <TableRow>
          <TableHeaderCell>Line</TableHeaderCell>
          <TableHeaderCell numeric>Spent</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {lines.map((l) => (
          <TableRow key={l.name} tone={l.tone}>
            <TableCell tone="strong">{l.name}</TableCell>
            <TableCell numeric>{l.spent}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

/** `TableFoot` is the `<tfoot>` for totals: strong cells and a firmer line above each row, alone and in a card alike. */
export const Totals: S = {
  render: () => (
    <div className="flex flex-col gap-6">
      <Table label="Budget">
        <TableHead>
          <TableRow>
            <TableHeaderCell>Line</TableHeaderCell>
            <TableHeaderCell numeric>Spent</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>Groceries</TableCell>
            <TableCell numeric>R 4 120.00</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Eating out</TableCell>
            <TableCell numeric>R 2 980.00</TableCell>
          </TableRow>
        </TableBody>
        <TableFoot>
          <TableRow>
            <TableCell>Subtotal</TableCell>
            <TableCell numeric>R 7 100.00</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Total</TableCell>
            <TableCell numeric tone="danger">
              R 7 100.00
            </TableCell>
          </TableRow>
        </TableFoot>
      </Table>
      <Card title="Budget">
        <Table label="Budget">
          <TableHead>
            <TableRow>
              <TableHeaderCell>Line</TableHeaderCell>
              <TableHeaderCell numeric>Spent</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Groceries</TableCell>
              <TableCell numeric>R 4 120.00</TableCell>
            </TableRow>
          </TableBody>
          <TableFoot>
            <TableRow>
              <TableCell>Total</TableCell>
              <TableCell numeric>R 4 120.00</TableCell>
            </TableRow>
          </TableFoot>
        </Table>
      </Card>
    </div>
  ),
};

/** `TableGroupRow` is a full-width group header: its `label` spans the `colSpan` columns you give it (the table's column count), `trailing` sits at the far end. A full-width panel (an empty state, a note) is a `TableCell` with `colSpan`. */
export const GroupRows: S = {
  render: () => (
    <Table label="Budget by group">
      <TableHead>
        <TableRow>
          <TableHeaderCell>Line</TableHeaderCell>
          <TableHeaderCell>Account</TableHeaderCell>
          <TableHeaderCell numeric>Spent</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableGroupRow label="Home" trailing="R 4 120.00" colSpan={3} />
        <TableRow>
          <TableCell>Groceries</TableCell>
          <TableCell tone="muted">Cheque</TableCell>
          <TableCell numeric>R 4 120.00</TableCell>
        </TableRow>
        <TableGroupRow label="Fun" trailing="R 0.00" colSpan={3} />
        <TableRow>
          <TableCell colSpan={3} tone="muted">
            Nothing spent in this group yet.
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};

const SIGN: Partial<Record<CellTone, string>> = { positive: "+ ", danger: "- " };

/** `tone` on a cell takes the shared tones (`neutral` is the default) as well as `strong` and `muted`, for an amount that means something. Colour alone does not say it: pair it with a sign or a word. */
export const CellTones: S = {
  render: () => (
    <Table label="Amounts">
      <TableHead>
        <TableRow>
          <TableHeaderCell>Tone</TableHeaderCell>
          <TableHeaderCell numeric>Amount</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {(["neutral", "strong", "muted", "info", "positive", "warn", "danger"] as const).map(
          (tone) => (
            <TableRow key={tone}>
              <TableCell mono>{tone}</TableCell>
              <TableCell numeric tone={tone}>
                {`${SIGN[tone] ?? ""}R 349.00`}
              </TableCell>
            </TableRow>
          ),
        )}
      </TableBody>
    </Table>
  ),
};

/** `truncate` caps a long value's width, ellipsises it on one line and puts the full text in a `title`. One width, no prop. */
export const Truncate: S = {
  render: () => (
    <Table label="Branches">
      <TableHead>
        <TableRow>
          <TableHeaderCell>Branch</TableHeaderCell>
          <TableHeaderCell numeric>Commits</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell mono truncate>
            feature/omnibus-planner-rework-the-whole-budget-import-flow-end-to-end
          </TableCell>
          <TableCell numeric>14</TableCell>
        </TableRow>
        <TableRow>
          <TableCell mono truncate>
            main
          </TableCell>
          <TableCell numeric>212</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};
