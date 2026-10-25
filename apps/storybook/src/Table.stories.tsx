import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Card,
  Pill,
  rowLinkClass,
  Table,
  TableBody,
  TableCell,
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
              <a href={`#${q.ref}`} className={rowLinkClass}>
                {q.ref}
              </a>
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
