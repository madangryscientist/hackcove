import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  rowLinkClass,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "./Table.js";

describe("Table", () => {
  it("is a rounded bordered card that scrolls sideways around a full-width table", () => {
    const out = renderToStaticMarkup(
      <Table>
        <TableBody>{null}</TableBody>
      </Table>,
    );
    expect(out).toMatch(
      /^<div class="overflow-x-auto rounded-xl border border-slate-200\/70 bg-white/,
    );
    expect(out).toContain('<table class="w-full text-left text-sm">');
    expect(out).not.toContain("<caption");
  });

  it("caption names the table and is screen-reader only; className goes on the card", () => {
    const out = renderToStaticMarkup(
      <Table caption="Quotes" className="mt-4">
        <TableBody>{null}</TableBody>
      </Table>,
    );
    expect(out).toContain('<caption class="sr-only">Quotes</caption>');
    expect(out).toContain("mt-4");
  });
});

describe("TableHead", () => {
  it("is an uppercase, tracked, muted strip on a tinted fill", () => {
    const out = renderToStaticMarkup(
      <table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Ref</TableHeaderCell>
          </TableRow>
        </TableHead>
      </table>,
    );
    expect(out).toContain("<thead");
    for (const c of ["uppercase", "tracking-wide", "text-slate-500", "bg-slate-50"]) {
      expect(out).toContain(c);
    }
  });
});

describe("TableBody and TableRow", () => {
  it("body rows get a line above and a hover fill; a row is relative, the anchor of a row link", () => {
    const out = renderToStaticMarkup(
      <table>
        <TableBody>
          <TableRow>
            <TableCell>x</TableCell>
          </TableRow>
        </TableBody>
      </table>,
    );
    expect(out).toContain("[&amp;&gt;tr]:border-t");
    expect(out).toContain("[&amp;&gt;tr:hover]:bg-slate-50");
    expect(out).toContain('<tr class="relative">');
  });
});

describe("TableHeaderCell", () => {
  it("is a column header aligned to the start by default and the end on request", () => {
    const start = renderToStaticMarkup(
      <table>
        <thead>
          <tr>
            <TableHeaderCell>Name</TableHeaderCell>
          </tr>
        </thead>
      </table>,
    );
    const end = renderToStaticMarkup(
      <table>
        <thead>
          <tr>
            <TableHeaderCell align="end">Premium</TableHeaderCell>
          </tr>
        </thead>
      </table>,
    );
    expect(start).toContain('<th scope="col"');
    expect(start).toContain("text-left");
    expect(end).toContain("text-right");
  });
});

function cell(props: Parameters<typeof TableCell>[0]): string {
  return renderToStaticMarkup(
    <table>
      <tbody>
        <tr>
          <TableCell {...props} />
        </tr>
      </tbody>
    </table>,
  );
}

describe("TableCell", () => {
  it("defaults to start-aligned slate-700 text", () => {
    const out = cell({ children: "x" });
    expect(out).toContain("<td");
    expect(out).toContain("text-left");
    expect(out).toContain("whitespace-nowrap");
    expect(out).toContain("text-slate-700");
    expect(out).not.toContain("tabular-nums");
    expect(out).not.toContain("font-mono");
  });

  it("tone strong is medium slate-900 and muted is slate-500", () => {
    expect(cell({ tone: "strong", children: "x" })).toContain("font-medium text-slate-900");
    expect(cell({ tone: "muted", children: "x" })).toContain("text-slate-500");
  });

  it("align end right-aligns; numeric sets tabular figures; mono a small mono face", () => {
    expect(cell({ align: "end", children: "x" })).toContain("text-right");
    expect(cell({ numeric: true, children: "x" })).toContain("tabular-nums");
    expect(cell({ mono: true, children: "x" })).toContain("font-mono text-xs");
  });
});

describe("rowLinkClass", () => {
  it("styles a link and stretches it over the row", () => {
    expect(rowLinkClass).toContain("text-violet-600");
    expect(rowLinkClass).toContain("after:absolute after:inset-0");
  });
});
