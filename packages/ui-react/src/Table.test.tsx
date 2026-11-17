// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { Card } from "./Card.js";
import { follows, render, screen, within } from "./render.harness.js";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "./Table.js";

/** One body cell in a bare table, so the cell is all there is to find. */
const cell = (props: Parameters<typeof TableCell>[0]) =>
  render(
    <table>
      <tbody>
        <tr>
          <TableCell {...props} />
        </tr>
      </tbody>
    </table>,
  );

describe("Table", () => {
  it("is named by its label", () => {
    render(
      <Table label="Quotes">
        <TableBody>{null}</TableBody>
      </Table>,
    );
    expect(screen.getByRole("table", { name: "Quotes" })).not.toBeNull();
  });

  it("is still a table named by its label inside a Card, where it is plain", () => {
    render(
      <Card title="Quotes">
        <Table label="Quotes">
          <TableHead>
            <TableRow>
              <TableHeaderCell>Ref</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>x</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>,
    );
    const table = screen.getByRole("table", { name: "Quotes" });
    expect(within(table).getByRole("columnheader", { name: "Ref" })).not.toBeNull();
    expect(within(table).getByRole("cell", { name: "x" })).not.toBeNull();
  });
});

describe("TableHeaderCell", () => {
  it("is a column header", () => {
    render(
      <table>
        <thead>
          <tr>
            <TableHeaderCell align="end">Premium</TableHeaderCell>
          </tr>
        </thead>
      </table>,
    );
    expect(screen.getByRole("columnheader", { name: "Premium" }).getAttribute("scope")).toBe("col");
  });
});

describe("TableCell", () => {
  it("is a cell holding its content", () => {
    cell({ children: "x" });
    expect(screen.getByRole("cell", { name: "x" })).not.toBeNull();
  });
});

describe("TableCell secondary", () => {
  it("reads a second line after the content, inside the cell", () => {
    cell({ children: "Naledi", secondary: "naledi@example.com" });
    const td = screen.getByRole("cell");
    expect(td.textContent).toBe("Naledinaledi@example.com");
    expect(
      follows(within(td).getByText("Naledi"), within(td).getByText("naledi@example.com")),
    ).toBeTruthy();
  });

  it("draws a second line of 0", () => {
    cell({ children: "n", secondary: 0 });
    expect(screen.getByRole("cell").textContent).toBe("n0");
  });

  it("draws no second line without one", () => {
    cell({ children: "Naledi" });
    expect(screen.getByRole("cell").textContent).toBe("Naledi");
  });

  it("draws no second line for false", () => {
    cell({ children: "Naledi", secondary: false });
    expect(screen.getByRole("cell").textContent).toBe("Naledi");
  });
});
