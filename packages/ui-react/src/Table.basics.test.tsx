// @vitest-environment jsdom
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, user } from "./render.harness.js";
import {
  Table,
  TableBody,
  TableCell,
  TableExpandCell,
  TableGroupRow,
  TableHead,
  TableHeaderCell,
  TableRow,
  type TableSort,
} from "./Table.js";

const FOUR = (
  <TableHead>
    <TableRow>
      <TableHeaderCell>Quote</TableHeaderCell>
      <TableHeaderCell>Customer</TableHeaderCell>
      <TableHeaderCell numeric>Total</TableHeaderCell>
      <TableHeaderCell label="Details" />
    </TableRow>
  </TableHead>
);

function sortable(sort: TableSort, onSort: (next: "ascending" | "descending") => void): ReactNode {
  return (
    <Table label="Quotes">
      <TableHead>
        <TableRow>
          <TableHeaderCell>Quote</TableHeaderCell>
          <TableHeaderCell numeric sort={sort} onSort={onSort}>
            Total
          </TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>{[]}</TableBody>
    </Table>
  );
}

describe("a sortable column", () => {
  it("is a button named by its title, with no aria-sort while unsorted; a click asks for ascending", async () => {
    const onSort = vi.fn<(next: "ascending" | "descending") => void>();
    render(sortable("none", onSort));
    expect(screen.getByRole("columnheader", { name: "Total" }).hasAttribute("aria-sort")).toBe(
      false,
    );
    await user().click(screen.getByRole("button", { name: "Total" }));
    expect(onSort).toHaveBeenCalledWith("ascending");
  });

  it("says ascending and asks for descending", async () => {
    const onSort = vi.fn<(next: "ascending" | "descending") => void>();
    render(sortable("ascending", onSort));
    expect(screen.getByRole("columnheader", { name: "Total" }).getAttribute("aria-sort")).toBe(
      "ascending",
    );
    await user().click(screen.getByRole("button", { name: "Total" }));
    expect(onSort).toHaveBeenCalledWith("descending");
  });

  it("from descending asks for ascending, and Enter works as a click", async () => {
    const onSort = vi.fn<(next: "ascending" | "descending") => void>();
    render(sortable("descending", onSort));
    screen.getByRole("button", { name: "Total" }).focus();
    await user().keyboard("{Enter}");
    expect(onSort).toHaveBeenCalledWith("ascending");
  });
});

describe("rows", () => {
  it("a selected row is aria-current, and no other", () => {
    render(
      <Table label="Quotes">
        <TableBody>
          <TableRow selected tone="warn">
            <TableCell>Q-1043</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Q-1044</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(screen.getByRole("row", { name: /Q-1043/ }).getAttribute("aria-current")).toBe("true");
    expect(screen.getByRole("row", { name: /Q-1044/ }).hasAttribute("aria-current")).toBe(false);
  });

  it("an expand cell is a named button that says whether its row is open", async () => {
    const onClick = vi.fn<() => void>();
    const { rerender } = render(
      <Table label="Quotes">
        <TableBody>
          <TableRow>
            <TableExpandCell
              expanded={false}
              label="Details"
              count={3}
              onClick={onClick}
              aria-controls="q-1043"
            />
          </TableRow>
        </TableBody>
      </Table>,
    );
    const button = screen.getByRole("button", { name: /^Details, ?3$/ });
    expect(button.getAttribute("aria-expanded")).toBe("false");
    await user().click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
    rerender(
      <Table label="Quotes">
        <TableBody>
          <TableRow>
            <TableExpandCell
              expanded
              label="Details"
              count={3}
              onClick={onClick}
              aria-controls="q-1043"
            />
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(
      screen.getByRole("button", { name: /^Details, ?3$/ }).getAttribute("aria-expanded"),
    ).toBe("true");
    expect(
      screen.getByRole("button", { name: /^Details, ?3$/ }).getAttribute("aria-controls"),
    ).toBe("q-1043");
  });
});

describe("spans from the head's column count", () => {
  it("a span=full cell spans every column", () => {
    render(
      <Table label="Quotes">
        {FOUR}
        <TableBody>
          <TableRow>
            <TableCell span="full">The detail of Q-1043</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(screen.getByRole("cell", { name: "The detail of Q-1043" }).getAttribute("colspan")).toBe(
      "4",
    );
  });

  it("a group row with no colSpan spans every column", () => {
    render(
      <Table label="Quotes">
        {FOUR}
        <TableBody>
          <TableGroupRow label="March" />
        </TableBody>
      </Table>,
    );
    expect(screen.getByRole("rowheader", { name: "March" }).getAttribute("colspan")).toBe("4");
  });

  it("an empty body spans every column, and one row hides it", () => {
    const { rerender } = render(
      <Table label="Quotes">
        {FOUR}
        <TableBody empty="No quotes yet.">{[]}</TableBody>
      </Table>,
    );
    expect(screen.getByRole("cell", { name: "No quotes yet." }).getAttribute("colspan")).toBe("4");
    rerender(
      <Table label="Quotes">
        {FOUR}
        <TableBody empty="No quotes yet.">
          <TableRow>
            <TableCell>Q-1043</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(screen.queryByText("No quotes yet.")).toBeNull();
  });
});
