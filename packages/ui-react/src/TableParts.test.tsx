// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen, within } from "./render.harness.js";
import {
  Table,
  TableBody,
  TableCell,
  TableFoot,
  TableGroupRow,
  TableHeaderCell,
  TableRow,
} from "./Table.js";

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

describe("TableFoot", () => {
  it("is the table's foot: a row group after the body, holding its rows", () => {
    render(
      <Table caption="Costs">
        <TableBody>
          <TableRow>
            <TableCell>Rent</TableCell>
          </TableRow>
        </TableBody>
        <TableFoot>
          <TableRow>
            <TableCell>Total</TableCell>
          </TableRow>
        </TableFoot>
      </Table>,
    );
    const table = screen.getByRole<HTMLTableElement>("table", { name: "Costs" });
    expect(within(table).getAllByRole("rowgroup")[1]).toBe(table.tFoot);
    expect(table.tFoot?.textContent).toBe("Total");
    expect(table.tBodies[0]?.textContent).toBe("Rent");
  });
});

describe("TableGroupRow", () => {
  it("is one row whose header names the group and spans the given columns", () => {
    render(
      <table>
        <TableBody>
          <TableGroupRow label="Fixed costs" colSpan={3} />
        </TableBody>
      </table>,
    );
    const header = within(screen.getByRole("row")).getByRole<HTMLTableCellElement>("rowheader", {
      name: "Fixed costs",
    });
    expect(header.colSpan).toBe(3);
    expect(header.getAttribute("scope")).toBe("rowgroup");
  });

  it("reads trailing content after the label, inside the header", () => {
    render(
      <table>
        <TableBody>
          <TableGroupRow label="Fixed costs" colSpan={3} trailing="R 4 000.00" />
        </TableBody>
      </table>,
    );
    expect(screen.getByRole("rowheader").textContent).toBe("Fixed costsR 4 000.00");
  });

  it("draws trailing content of 0", () => {
    render(
      <table>
        <TableBody>
          <TableGroupRow label="Fixed costs" colSpan={3} trailing={0} />
        </TableBody>
      </table>,
    );
    expect(screen.getByRole("rowheader").textContent).toBe("Fixed costs0");
  });

  it("draws no trailing content for false", () => {
    render(
      <table>
        <TableBody>
          <TableGroupRow label="Fixed costs" colSpan={3} trailing={false} />
        </TableBody>
      </table>,
    );
    expect(screen.getByRole("rowheader").textContent).toBe("Fixed costs");
  });
});

describe("TableCell colSpan", () => {
  it("passes through, for a full-width panel cell", () => {
    cell({ colSpan: 4, children: "Nothing yet" });
    expect(screen.getByRole<HTMLTableCellElement>("cell", { name: "Nothing yet" }).colSpan).toBe(4);
  });
});

describe("TableCell truncate", () => {
  it("puts the full text in a title", () => {
    cell({ truncate: true, mono: true, children: "feature/very-long-branch-name" });
    expect(screen.getByTitle("feature/very-long-branch-name").textContent).toBe(
      "feature/very-long-branch-name",
    );
  });

  it("titles a number, end-aligned", () => {
    cell({ truncate: true, align: "end", children: 12 });
    expect(screen.getByTitle("12").textContent).toBe("12");
  });

  it("titles the joined text of mixed strings and numbers", () => {
    cell({ truncate: true, children: ["R ", 12] });
    expect(screen.getByTitle("R 12")).not.toBeNull();
  });

  it("titles nothing without it", () => {
    cell({ children: "x" });
    expect(screen.queryByTitle("x")).toBeNull();
  });

  it("gives a node no title", () => {
    cell({ truncate: true, children: <b>x</b> });
    expect(screen.queryByTitle("x")).toBeNull();
    expect(screen.getByText("x")).not.toBeNull();
  });

  it("keeps the second line outside the titled box", () => {
    cell({ truncate: true, children: "Naledi", secondary: "second" });
    expect(screen.getByTitle("Naledi").textContent).toBe("Naledi");
    expect(within(screen.getByRole("cell")).getByText("second")).not.toBeNull();
  });
});

describe("TableHeaderCell srLabel", () => {
  it("names the column in place of the children", () => {
    render(
      <table>
        <thead>
          <tr>
            <TableHeaderCell align="end" srLabel="Actions" />
          </tr>
        </thead>
      </table>,
    );
    expect(screen.getByRole("columnheader", { name: "Actions" }).getAttribute("scope")).toBe("col");
  });
});

describe("TableRow emphasis", () => {
  it("keeps the row in the body, with no foot", () => {
    render(
      <Table caption="Costs">
        <TableBody>
          <TableRow emphasis>
            <TableCell>Subtotal</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const table = screen.getByRole<HTMLTableElement>("table", { name: "Costs" });
    expect(table.tFoot).toBeNull();
    expect(table.tBodies[0]?.textContent).toBe("Subtotal");
  });

  it("types out alongside a tone or a stripe", () => {
    render(
      <table>
        <TableBody>
          {/* @ts-expect-error emphasis takes no tone */}
          <TableRow emphasis tone="warn">
            <TableCell>x</TableCell>
          </TableRow>
          {/* @ts-expect-error emphasis takes no stripe */}
          <TableRow emphasis stripe="warn">
            <TableCell>y</TableCell>
          </TableRow>
        </TableBody>
      </table>,
    );
    expect(screen.getAllByRole("row")).toHaveLength(2);
  });
});
