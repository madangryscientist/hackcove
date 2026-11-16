// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { Card } from "./Card.js";
import { render, screen, within } from "./render.harness.js";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "./Table.js";

// A table takes its name from `label`, its current row from `selected`, and a column of figures
// from one `numeric` head cell. That a numeric column lines up at the end in tabular figures is a
// look, checked by the visual check, not here.

const amounts = [
  { name: "Rent", amount: "R 9 000.00" },
  { name: "Food", amount: "R 3 200.00" },
];

/** The body cell in the column under `header`, in the row that holds `rowText`. */
function cellUnder(header: string, rowText: string): HTMLElement {
  const heads = screen.getAllByRole("columnheader");
  const column = heads.findIndex((head) => head.textContent === header);
  const row = screen.getByRole("row", { name: new RegExp(rowText) });
  const cell = within(row).getAllByRole("cell")[column];
  if (!cell) throw new Error(`no cell under ${header} in ${rowText}`);
  return cell;
}

describe("a Table", () => {
  it("is named by its label", () => {
    render(
      <Table label="Budget">
        <TableBody>{null}</TableBody>
      </Table>,
    );
    expect(screen.getByRole("table", { name: "Budget" })).not.toBeNull();
  });

  it("marks a selected row aria-selected, and no other", () => {
    render(
      <Table label="Budget">
        <TableBody>
          {amounts.map((line) => (
            <TableRow key={line.name} selected={line.name === "Food"}>
              <TableCell>{line.name}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>,
    );
    expect(screen.getByRole("row", { name: "Food", selected: true })).not.toBeNull();
    expect(screen.queryByRole("row", { name: "Rent", selected: true })).toBeNull();
  });

  it("finds a figure under the numeric column's header, the head declared once and mapped", () => {
    const columns = [
      { title: "Line", numeric: false },
      { title: "Amount", numeric: true },
    ];
    render(
      <Card title="Budget">
        <Table label="Budget">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableHeaderCell key={column.title} numeric={column.numeric}>
                  {column.title}
                </TableHeaderCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {amounts.map((line) => (
              <TableRow key={line.name}>
                <>
                  <TableCell>{line.name}</TableCell>
                  <TableCell>{line.amount}</TableCell>
                </>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>,
    );
    expect(cellUnder("Amount", "Food").textContent).toBe("R 3 200.00");
    expect(cellUnder("Line", "Rent").textContent).toBe("Rent");
  });

  it("names an actions column by its label", () => {
    render(
      <Table label="Budget">
        <TableHead>
          <TableRow>
            <TableHeaderCell>Line</TableHeaderCell>
            <TableHeaderCell label="Actions" />
          </TableRow>
        </TableHead>
        <TableBody>{null}</TableBody>
      </Table>,
    );
    expect(screen.getByRole("columnheader", { name: "Actions" })).not.toBeNull();
  });
});
