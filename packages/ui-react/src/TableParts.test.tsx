import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { lifted } from "./lift.harness.js";
import {
  type CellTone,
  Table,
  TableBody,
  TableCell,
  TableFoot,
  TableGroupRow,
  TableHeaderCell,
  TableRow,
} from "./Table.js";

const inSection = (section: "body" | "foot", variant: "card" | "plain" = "card"): string => {
  const Section = section === "body" ? TableBody : TableFoot;
  return renderToStaticMarkup(
    <Table variant={variant}>
      <Section>
        <TableRow>
          <TableCell>Total</TableCell>
          <TableCell align="end" numeric tone="danger">
            R 1.00
          </TableCell>
        </TableRow>
      </Section>
    </Table>,
  );
};

describe("TableFoot", () => {
  it("is a <tfoot> whose rows have a firmer line above and no hover, in both variants", () => {
    for (const variant of ["card", "plain"] as const) {
      const out = inSection("foot", variant);
      expect(out).toContain("<tfoot>");
      expect(out).toContain(`<tr class="relative border-t border-slate-300 ${lifted}">`);
      expect(out).not.toContain("hover:");
    }
  });

  it("its cells are strong by default and medium whatever the tone", () => {
    const out = inSection("foot");
    expect(out).toContain("font-medium text-slate-900");
    expect(out).toMatch(/text-red-700 font-medium/);
    expect(out).not.toMatch(/font-medium[^"]*font-medium/);
    expect(inSection("body")).not.toContain("font-medium text-slate-900");
  });

  it("an explicit tone wins over the foot's default", () => {
    const out = renderToStaticMarkup(
      <table>
        <TableFoot>
          <tr>
            <TableCell tone="muted">x</TableCell>
          </tr>
        </TableFoot>
      </table>,
    );
    expect(out).toContain("text-slate-500");
    expect(out).not.toContain("text-slate-900");
  });

  it("passes id, data-* and aria-* through", () => {
    const out = renderToStaticMarkup(
      <table>
        <TableFoot id="f" data-a="1" aria-label="Totals">
          {null}
        </TableFoot>
      </table>,
    );
    expect(out).toMatch(/<tfoot[^>]*id="f"[^>]*data-a="1"[^>]*aria-label="Totals"/);
  });
});

const group = (props: Partial<Parameters<typeof TableGroupRow>[0]> = {}): string =>
  renderToStaticMarkup(
    <table>
      <TableBody>
        <TableGroupRow label="Fixed costs" colSpan={3} {...props} />
      </TableBody>
    </table>,
  );

describe("TableGroupRow", () => {
  it("is one tinted row whose header cell spans the given columns", () => {
    const out = group();
    expect(out).toContain('<tr class="relative border-t border-slate-200/70 bg-slate-50">');
    expect(out).toMatch(/<th scope="rowgroup" colSpan="3"/i);
    expect(out).toContain("Fixed costs");
    expect(out).not.toContain("hover:");
  });

  it("draws trailing content at the far end, muted, and nothing for none", () => {
    expect(group({ trailing: "R 4 000.00" })).toContain(
      '<span class="shrink-0 font-normal text-slate-500">R 4 000.00</span>',
    );
    expect(group()).not.toContain("shrink-0");
    expect(group({ trailing: false })).not.toContain("shrink-0");
    expect(group({ trailing: 0 })).toContain(">0</span>");
  });

  it("passes id and data-* through", () => {
    const out = renderToStaticMarkup(
      <table>
        <tbody>
          <TableGroupRow label="x" colSpan={3} id="g" data-a="1" />
        </tbody>
      </table>,
    );
    expect(out).toMatch(/<tr[^>]*id="g"[^>]*data-a="1"/);
  });
});

const cell = (props: Parameters<typeof TableCell>[0]): string =>
  renderToStaticMarkup(
    <table>
      <tbody>
        <tr>
          <TableCell {...props} />
        </tr>
      </tbody>
    </table>,
  );

describe("TableCell colSpan", () => {
  it("passes through, for a full-width panel cell", () => {
    expect(cell({ colSpan: 4, children: "Nothing yet" })).toMatch(/<td[^>]*colSpan="4"/i);
  });
});

describe("TableCell semantic tones", () => {
  it("each Callout tone is its text colour, with no weight and no fill", () => {
    const looks: Array<[Exclude<CellTone, "default" | "strong" | "muted">, string]> = [
      ["neutral", "text-slate-600"],
      ["info", "text-blue-700"],
      ["positive", "text-emerald-700"],
      ["warn", "text-amber-700"],
      ["danger", "text-red-700"],
    ];
    for (const [tone, text] of looks) {
      const out = cell({ tone, children: "x" });
      expect(out).toContain(text);
      expect(out).not.toContain("font-medium");
      expect(out).not.toContain("bg-");
    }
  });
});

describe("TableCell truncate", () => {
  it("caps the width, ellipsises and puts the full text in a title", () => {
    const out = cell({ truncate: true, mono: true, children: "feature/very-long-branch-name" });
    expect(out).toContain(
      '<div class="max-w-xs truncate" title="feature/very-long-branch-name">feature/very-long-branch-name</div>',
    );
  });

  it("keeps an end-aligned value at the end, and titles a number", () => {
    const out = cell({ truncate: true, align: "end", children: 12 });
    expect(out).toContain('class="max-w-xs truncate ml-auto" title="12"');
  });

  it("titles the joined text of mixed strings and numbers", () => {
    expect(cell({ truncate: true, children: ["R ", 12] })).toContain('title="R 12"');
  });

  it("wraps nothing and titles nothing without it, and a node gets no title", () => {
    expect(cell({ children: "x" })).not.toContain("truncate");
    expect(cell({ truncate: true, children: <b>x</b> })).not.toContain("title=");
  });

  it("keeps the second line outside the truncated box", () => {
    const out = cell({ truncate: true, children: "Naledi", secondary: "second" });
    expect(out).toContain('title="Naledi">Naledi</div><div class="text-xs font-normal');
  });
});

describe("TableHeaderCell srLabel", () => {
  it("is a visually hidden column name in place of the children", () => {
    const out = renderToStaticMarkup(
      <table>
        <thead>
          <tr>
            <TableHeaderCell align="end" srLabel="Actions" />
          </tr>
        </thead>
      </table>,
    );
    expect(out).toContain('<th scope="col"');
    expect(out).toContain('<span class="sr-only">Actions</span>');
  });
});

describe("TableCell align center", () => {
  it("centres the cell, and a truncate cell's box follows", () => {
    expect(cell({ align: "center", colSpan: 4, children: "Nothing yet" })).toContain("text-center");
    expect(cell({ align: "center", truncate: true, children: "x" })).toContain(
      'class="max-w-xs truncate mx-auto"',
    );
  });

  it("centres a column title", () => {
    const out = renderToStaticMarkup(
      <table>
        <thead>
          <tr>
            <TableHeaderCell align="center">Status</TableHeaderCell>
          </tr>
        </thead>
      </table>,
    );
    expect(out).toContain("text-center");
  });
});

describe("TableCell indent", () => {
  it("sets the cell in one step per level", () => {
    const looks = [
      [1, "pl-8"],
      [2, "pl-12"],
      [3, "pl-16"],
    ] as const;
    for (const [indent, padding] of looks) {
      expect(cell({ indent, children: "x" })).toContain(padding);
    }
  });

  it("has no extra padding without it, and does nothing to a cell that is not start-aligned", () => {
    expect(cell({ children: "x" })).not.toMatch(/\bpl-/);
    expect(cell({ indent: 2, align: "end", children: "x" })).not.toMatch(/\bpl-/);
    expect(cell({ indent: 2, align: "center", children: "x" })).not.toMatch(/\bpl-/);
  });
});

const emphasised = (variant: "card" | "plain" = "card"): string =>
  renderToStaticMarkup(
    <Table variant={variant}>
      <TableBody>
        <TableRow emphasis>
          <TableCell>Subtotal</TableCell>
          <TableCell tone="danger">R 1.00</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Next line</TableCell>
        </TableRow>
      </TableBody>
    </Table>,
  );

describe("TableRow emphasis", () => {
  it("in the body has a foot row's firmer line, strong cells and no hover, in both variants", () => {
    for (const variant of ["card", "plain"] as const) {
      const out = emphasised(variant);
      expect(out).toContain("<tbody>");
      expect(out).not.toContain("<tfoot");
      expect(out).toContain(`<tr class="relative border-t border-slate-300 ${lifted}">`);
      expect(out).toMatch(/font-medium text-slate-900[^>]*>Subtotal/);
      expect(out).toMatch(/text-red-700 font-medium[^>]*>R 1.00/);
    }
  });

  it("does not reach the next row", () => {
    const out = emphasised();
    expect(out).toContain(
      `<tr class="relative border-t border-slate-200/70 ${lifted} hover:bg-slate-50">`,
    );
    expect(out).not.toMatch(/font-medium[^>]*>Next line/);
  });

  it("false is a plain body row, for a condition", () => {
    const out = renderToStaticMarkup(
      <table>
        <TableBody>
          <TableRow emphasis={false}>
            <TableCell>x</TableCell>
          </TableRow>
        </TableBody>
      </table>,
    );
    expect(out).toContain("hover:bg-slate-50");
    expect(out).not.toContain("border-slate-300");
  });

  it("does nothing in the head", () => {
    const out = renderToStaticMarkup(
      <table>
        <thead>
          <TableRow emphasis>
            <TableCell>x</TableCell>
          </TableRow>
        </thead>
      </table>,
    );
    expect(out).not.toContain("border-slate-300");
    expect(out).not.toContain("font-medium");
  });

  it("types out alongside a tone or a stripe", () => {
    const out = renderToStaticMarkup(
      <table>
        <TableBody>
          {/* @ts-expect-error emphasis takes no tone */}
          <TableRow emphasis tone="warn">
            <TableCell>x</TableCell>
          </TableRow>
          {/* @ts-expect-error emphasis takes no stripe */}
          <TableRow emphasis stripe="warn">
            <TableCell>x</TableCell>
          </TableRow>
        </TableBody>
      </table>,
    );
    expect(out).toContain("<tbody>");
  });
});
