import type { Meta, StoryObj } from "@storybook/react-vite";
import { Fragment, useState } from "react";
import {
  Button,
  Card,
  Pill,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableExpandCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  TextLink,
} from "@hackcove/ui-react";

const meta: Meta = { title: "Data/Table" };
export default meta;
type S = StoryObj;

const QUOTES = [
  {
    ref: "Q-1043",
    customer: "Cove Hardware",
    total: "R 18 400",
    lines: ["Paint", "Brushes", "Tape"],
  },
  { ref: "Q-1044", customer: "Harbour Books", total: "R 2 350", lines: ["Shelving"] },
];

function Rows({ size }: { size: "sm" | "md" | "lg" }) {
  return (
    <Table label={`Quotes at ${size}`} size={size}>
      <TableHead>
        <TableRow>
          <TableHeaderCell>Quote</TableHeaderCell>
          <TableHeaderCell>Customer</TableHeaderCell>
          <TableHeaderCell numeric>Total</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {QUOTES.map((quote) => (
          <TableRow key={quote.ref}>
            <TableCell tone="strong">{quote.ref}</TableCell>
            <TableCell>{quote.customer}</TableCell>
            <TableCell>{quote.total}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

/** The same rows at `size` `sm` (the default), `md` and `lg`: the row padding, and the controls in the rows follow it. */
export const Density: S = {
  render: () => (
    <Stack gap="md">
      <Rows size="sm" />
      <Rows size="md" />
      <Rows size="lg" />
    </Stack>
  ),
};

/** `selected` marks the row whose detail is open beside the table: the selected fill and `aria-current`. */
export const Selected: S = {
  render: () => (
    <Table label="Quotes">
      <TableHead>
        <TableRow>
          <TableHeaderCell>Quote</TableHeaderCell>
          <TableHeaderCell>Customer</TableHeaderCell>
          <TableHeaderCell numeric>Total</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {QUOTES.map((quote, i) => (
          <TableRow key={quote.ref} selected={i === 0}>
            <TableCell tone="strong">{quote.ref}</TableCell>
            <TableCell>{quote.customer}</TableCell>
            <TableCell>{quote.total}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

/** A `TableExpandCell` opens its row: one row open with a `span="full"` panel under it, one closed with its `count`. */
export const Expanded: S = {
  render: () => {
    const [open, setOpen] = useState<string | undefined>("Q-1043");
    return (
      <Table label="Quotes">
        <TableHead>
          <TableRow>
            <TableHeaderCell label="Details" />
            <TableHeaderCell>Quote</TableHeaderCell>
            <TableHeaderCell>Customer</TableHeaderCell>
            <TableHeaderCell numeric>Total</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {QUOTES.map((quote) => (
            <Fragment key={quote.ref}>
              <TableRow>
                <TableExpandCell
                  expanded={open === quote.ref}
                  label="Details"
                  count={quote.lines.length}
                  aria-controls={`${quote.ref}-lines`}
                  onClick={() => setOpen(open === quote.ref ? undefined : quote.ref)}
                />
                <TableCell tone="strong">{quote.ref}</TableCell>
                <TableCell>{quote.customer}</TableCell>
                <TableCell>{quote.total}</TableCell>
              </TableRow>
              {open === quote.ref && (
                <TableRow id={`${quote.ref}-lines`}>
                  <TableCell span="full" tone="muted">
                    {quote.lines.join(", ")}
                  </TableCell>
                </TableRow>
              )}
            </Fragment>
          ))}
        </TableBody>
      </Table>
    );
  },
};

/** Six columns of short controls in a card: each takes its content's width, so the Archive button is whole and the table does not scroll sideways. */
export const ShortControls: S = {
  render: () => (
    <div className="w-[1280px]">
      <Card>
        <Table label="Flags">
          <TableHead>
            <TableRow>
              <TableHeaderCell>Flag</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Tags</TableHeaderCell>
              <TableHeaderCell>On</TableHeaderCell>
              <TableHeaderCell>Changed</TableHeaderCell>
              <TableHeaderCell label="Actions" />
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>
                <TextLink href="#new-checkout">new-checkout</TextLink>
              </TableCell>
              <TableCell>
                <Pill tone="positive">Live</Pill>
              </TableCell>
              <TableCell>
                <Pill>web</Pill> <Pill>beta</Pill>
              </TableCell>
              <TableCell>
                <Switch aria-label="new-checkout on" checked onChange={() => undefined} />
              </TableCell>
              <TableCell>12 Nov</TableCell>
              <TableCell align="end">
                <Button variant="outline">Archive</Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>
    </div>
  ),
};
