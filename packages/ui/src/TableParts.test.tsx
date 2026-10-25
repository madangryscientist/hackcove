import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  type CellTone,
  Table,
  TableBody,
  TableCell,
  TableFoot,
  TableGroupRow,
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
      expect(out).toContain('<tr class="relative border-t border-slate-300">');
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
