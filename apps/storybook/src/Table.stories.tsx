import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  type CellTone,
  Card,
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
} from "@hackcove/ui";

const meta: Meta = { title: "UI/Table" };
export default meta;
type S = StoryObj;

const quotes = [
  { ref: "Q-1042", client: "Naledi Dlamini", premium: "R 1 249.00", status: "sent" as const },
  { ref: "Q-1043", client: "Pieter van Wyk", premium: "R 880.50", status: "accepted" as const },
  { ref: "Q-1044", client: "Thandi Mokoena", premium: "R 2 310.00", status: "sent" as const },
];

function QuotesTable() {
  return (
    <Table caption="Quotes">
      <TableHead>
        <TableRow>
          <TableHeaderCell>Reference</TableHeaderCell>
          <TableHeaderCell>Client</TableHeaderCell>
          <TableHeaderCell align="end">Premium</TableHeaderCell>
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
            <TableCell align="end" numeric>
              {q.premium}
            </TableCell>
            <TableCell tone="muted">
              <Pill tone={q.status === "accepted" ? "emerald" : "amber"}>{q.status}</Pill>
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
export const Narrow: S = {
  render: () => (
    <div className="max-w-xs">
      <QuotesTable />
    </div>
  ),
};

/** `variant="plain"`: no card, no header strip, no row hover; only the row dividers. For a table inside a card. */
export const Plain: S = {
  render: () => (
    <Card title="Quotes">
      <Table variant="plain" caption="Quotes">
        <TableHead>
          <TableRow>
            <TableHeaderCell>Client</TableHeaderCell>
            <TableHeaderCell align="end">Premium</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {quotes.map((q) => (
            <TableRow key={q.ref}>
              <TableCell tone="strong">{q.client}</TableCell>
              <TableCell align="end" numeric>
                {q.premium}
              </TableCell>
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
    <Table caption="Clients">
      <TableHead>
        <TableRow>
          <TableHeaderCell>Client</TableHeaderCell>
          <TableHeaderCell align="end">Premium</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {quotes.map((q) => (
          <TableRow key={q.ref} data-ref={q.ref}>
            <TableCell tone="strong" secondary={q.ref}>
              {q.client}
            </TableCell>
            <TableCell align="end" numeric secondary="per month">
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
    <Table caption="Budget">
      <TableHead>
        <TableRow>
          <TableHeaderCell>Line</TableHeaderCell>
          <TableHeaderCell align="end">Spent</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {lines.map((l) => (
          <TableRow key={l.name} tone={l.tone}>
            <TableCell tone="strong">{l.name}</TableCell>
            <TableCell align="end" numeric>
              {l.spent}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

/** `TableFoot` is the `<tfoot>` for totals and subtotals: strong cells and a firmer line above each row, in a card and in a `plain` table alike. */
export const Totals: S = {
  render: () => (
    <div className="flex flex-col gap-6">
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
            <TableCell>Subtotal</TableCell>
            <TableCell align="end" numeric>
              R 7 100.00
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Total</TableCell>
            <TableCell align="end" numeric tone="danger">
              R 7 100.00
            </TableCell>
          </TableRow>
        </TableFoot>
      </Table>
      <Card title="Budget">
        <Table variant="plain" caption="Budget">
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
          </TableBody>
          <TableFoot>
            <TableRow>
              <TableCell>Total</TableCell>
              <TableCell align="end" numeric>
                R 4 120.00
              </TableCell>
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
    <Table caption="Budget by group">
      <TableHead>
        <TableRow>
          <TableHeaderCell>Line</TableHeaderCell>
          <TableHeaderCell>Account</TableHeaderCell>
          <TableHeaderCell align="end">Spent</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableGroupRow label="Home" trailing="R 4 120.00" colSpan={3} />
        <TableRow>
          <TableCell>Groceries</TableCell>
          <TableCell tone="muted">Cheque</TableCell>
          <TableCell align="end" numeric>
            R 4 120.00
          </TableCell>
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

/** `tone` on a cell takes the Callout tones as well as `default`, `strong` and `muted`, for an amount that means something. Colour alone does not say it: pair it with a sign or a word. */
export const CellTones: S = {
  render: () => (
    <Table caption="Amounts">
      <TableHead>
        <TableRow>
          <TableHeaderCell>Tone</TableHeaderCell>
          <TableHeaderCell align="end">Amount</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {(
          ["default", "strong", "muted", "neutral", "info", "positive", "warn", "danger"] as const
        ).map((tone) => (
          <TableRow key={tone}>
            <TableCell mono>{tone}</TableCell>
            <TableCell align="end" numeric tone={tone}>
              {`${SIGN[tone] ?? ""}R 349.00`}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

/** `truncate` caps a long value's width, ellipsises it on one line and puts the full text in a `title`. One width, no prop. */
export const Truncate: S = {
  render: () => (
    <Table caption="Branches">
      <TableHead>
        <TableRow>
          <TableHeaderCell>Branch</TableHeaderCell>
          <TableHeaderCell align="end">Commits</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell mono truncate>
            feature/omnibus-planner-rework-the-whole-budget-import-flow-end-to-end
          </TableCell>
          <TableCell align="end" numeric>
            14
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell mono truncate>
            main
          </TableCell>
          <TableCell align="end" numeric>
            212
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};
