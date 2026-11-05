import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Card,
  IconButton,
  Input,
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

const plan = [
  { month: "Nov 2026", debt: "4000", reno: "1500", custom: true },
  { month: "Dec 2026", debt: "3000", reno: "1000", custom: false },
  { month: "Jan 2027", debt: "3000", reno: "1000", custom: false },
];

/** A grid of fields, one row per period, is a `plain` Table in a card: the label column takes the room left, the field columns fit their content, and the actions column has a screen-reader name. A `numeric` cell holds the figure; an `Input` with `align="end"` holds the edit. */
export const FieldsInRows: S = {
  render: () => (
    <Card title="Customise by month">
      <Table variant="plain" caption="Debt and reno split by month">
        <TableHead>
          <TableRow>
            <TableHeaderCell>Month</TableHeaderCell>
            <TableHeaderCell>Debt</TableHeaderCell>
            <TableHeaderCell>Reno</TableHeaderCell>
            <TableHeaderCell align="end">Pot</TableHeaderCell>
            <TableHeaderCell srLabel="Actions" />
          </TableRow>
        </TableHead>
        <TableBody>
          {plan.map((m) => (
            <TableRow key={m.month}>
              <TableCell numeric tone={m.custom ? "strong" : "muted"}>
                {m.month}
              </TableCell>
              <TableCell>
                <Input
                  aria-label={`Debt, ${m.month}`}
                  prefix="R"
                  align="end"
                  width="sm"
                  defaultValue={m.debt}
                  inputMode="decimal"
                />
              </TableCell>
              <TableCell>
                <Input
                  aria-label={`Reno, ${m.month}`}
                  prefix="R"
                  align="end"
                  width="sm"
                  defaultValue={m.reno}
                  inputMode="decimal"
                />
              </TableCell>
              <TableCell align="end" numeric tone="muted">
                R {Number(m.debt) + Number(m.reno)}
              </TableCell>
              <TableCell align="end">
                {m.custom && (
                  <IconButton label="Reset to default" size="sm" variant="ghost" tone="danger">
                    ✕
                  </IconButton>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  ),
};
