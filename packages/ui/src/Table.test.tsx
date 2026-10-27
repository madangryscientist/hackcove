import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { lifted } from "./lift.harness.js";
import {
  type RowTone,
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

  it("caption names the table and is screen-reader only", () => {
    const out = renderToStaticMarkup(
      <Table caption="Quotes">
        <TableBody>{null}</TableBody>
      </Table>,
    );
    expect(out).toContain('<caption class="sr-only">Quotes</caption>');
  });
});

describe("Table plain", () => {
  const plain = renderToStaticMarkup(
    <Table variant="plain" caption="Quotes">
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
    </Table>,
  );

  it("has no card border, fill or shadow, no header strip and no row hover", () => {
    for (const c of [
      "border-slate-200/70 bg-white",
      "rounded-xl",
      "shadow-sm",
      "bg-slate-50",
      "hover",
    ]) {
      expect(plain).not.toContain(c);
    }
    expect(plain).toContain('<div class="overflow-x-auto">');
  });

  it("keeps the row dividers and the head's small uppercase titles", () => {
    expect(plain).toContain(`<tr class="relative border-t border-slate-200/70 ${lifted}">`);
    expect(plain).toContain("uppercase");
  });
});

describe("rest props", () => {
  it("every element passes id, data-* and aria-* through", () => {
    const out = renderToStaticMarkup(
      <Table id="t" data-a="1" aria-busy="true">
        <TableHead id="h" data-a="2">
          <TableRow id="hr" data-a="3">
            <TableHeaderCell id="th" data-a="4">
              x
            </TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody id="b" data-a="5">
          <TableRow id="r" data-a="6" aria-selected="true">
            <TableCell id="td" data-a="7" colSpan={2}>
              x
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(out).toMatch(/<table[^>]*id="t"[^>]*data-a="1"[^>]*aria-busy="true"/);
    for (const [tag, id, n] of [
      ["thead", "h", "2"],
      ["tr", "hr", "3"],
      ["th", "th", "4"],
      ["tbody", "b", "5"],
      ["tr", "r", "6"],
      ["td", "td", "7"],
    ]) {
      expect(out).toMatch(new RegExp(`<${tag}[^>]*id="${id}"[^>]*data-a="${n}"`));
    }
    expect(out).toContain('aria-selected="true"');
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
    expect(out).toContain(
      `<tr class="relative border-t border-slate-200/70 ${lifted} hover:bg-slate-50">`,
    );
  });

  it("a head row is only relative: no line above, no hover", () => {
    const out = renderToStaticMarkup(
      <table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Ref</TableHeaderCell>
          </TableRow>
        </TableHead>
      </table>,
    );
    expect(out).toContain(`<tr class="relative ${lifted}">`);
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
    expect(out).not.toContain("whitespace-nowrap");
    expect(out).toContain("text-slate-700");
    expect(out).not.toContain("tabular-nums");
    expect(out).not.toContain("font-mono");
  });

  it("wraps prose at no less than min-w-48, and keeps a numeric or mono cell on one line", () => {
    expect(cell({ children: "x" })).toContain("min-w-48");
    expect(cell({ numeric: true, children: "1" })).toContain("whitespace-nowrap");
    expect(cell({ mono: true, children: "x" })).toContain("whitespace-nowrap");
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

describe("TableCell secondary", () => {
  it("draws a second muted line under the content", () => {
    const out = cell({ children: "Naledi", secondary: "naledi@example.com" });
    expect(out).toContain(
      'Naledi<div class="text-xs font-normal text-slate-500">naledi@example.com</div>',
    );
  });

  it("draws a second line of 0 and none for nothing", () => {
    expect(cell({ children: "n", secondary: 0 })).toContain(">0</div>");
    expect(cell({ children: "Naledi" })).not.toContain("font-normal");
    expect(cell({ children: "Naledi", secondary: false })).not.toContain("font-normal");
  });
});

describe("rowLinkClass", () => {
  it("styles a link and stretches it over the row", () => {
    expect(rowLinkClass).toContain("text-violet-600");
    expect(rowLinkClass).toContain("after:absolute after:inset-0");
  });
});

const toneRow = (tone: RowTone | undefined, section: "body" | "head" = "body"): string => {
  const Section = section === "body" ? TableBody : TableHead;
  return renderToStaticMarkup(
    <table>
      <Section>
        <TableRow tone={tone}>
          <TableCell>x</TableCell>
        </TableRow>
      </Section>
    </table>,
  );
};

describe("TableRow tone", () => {
  it("has no stripe and no fill by default", () => {
    const out = toneRow(undefined);
    expect(out).not.toContain("shadow-");
    expect(out).toContain("hover:bg-slate-50");
  });

  it("each Callout tone is a stripe on the leading edge in the tone's text colour, over its soft fill", () => {
    const looks: Array<[Exclude<RowTone, "muted">, string, string]> = [
      ["neutral", "bg-slate-50", "text-slate-500"],
      ["info", "bg-blue-50", "text-blue-700"],
      ["positive", "bg-emerald-50", "text-emerald-700"],
      ["warn", "bg-amber-50", "text-amber-700"],
      ["danger", "bg-red-50", "text-red-700"],
    ];
    for (const [tone, fill, text] of looks) {
      const out = toneRow(tone);
      for (const c of [fill, text, "shadow-[inset_4px_0_0_0_currentColor]"]) {
        expect(out, `${tone} has ${c}`).toContain(c);
      }
      expect(out, `${tone} keeps the fill, no hover`).not.toContain("hover:");
      expect(out).toContain("border-t border-slate-200/70");
    }
  });

  it("muted fades the row: no stripe, no fill, keeps the hover", () => {
    const out = toneRow("muted");
    expect(out).toContain("opacity-60");
    expect(out).not.toContain("shadow-");
    expect(out).toContain("hover:bg-slate-50");
  });

  it("a tone in the head does nothing, and a plain table keeps the stripe but no hover", () => {
    expect(toneRow("danger", "head")).not.toContain("shadow-");
    const plain = renderToStaticMarkup(
      <Table variant="plain">
        <TableBody>
          <TableRow tone="warn">
            <TableCell>x</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(plain).toContain("shadow-[inset_4px_0_0_0_currentColor]");
    expect(plain).not.toContain("hover:");
  });
});
