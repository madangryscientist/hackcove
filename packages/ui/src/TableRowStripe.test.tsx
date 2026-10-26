import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { TableBody, TableCell, TableHead, TableRow } from "./Table.js";
import type { TextTone } from "./typography.js";

const stripeRow = (stripe: TextTone, section: "body" | "head" = "body"): string => {
  const Section = section === "body" ? TableBody : TableHead;
  return renderToStaticMarkup(
    <table>
      <Section>
        <TableRow stripe={stripe}>
          <TableCell>x</TableCell>
        </TableRow>
      </Section>
    </table>,
  );
};

describe("TableRow stripe", () => {
  it("each tone is a stripe on the leading edge in its text colour, with no fill, keeping the hover", () => {
    const looks: Array<[TextTone, string]> = [
      ["muted", "text-slate-500"],
      ["info", "text-blue-700"],
      ["positive", "text-emerald-700"],
      ["warn", "text-amber-700"],
      ["danger", "text-red-700"],
    ];
    for (const [tone, text] of looks) {
      const out = stripeRow(tone);
      expect(out).toContain(text);
      expect(out).toContain("shadow-[inset_4px_0_0_0_currentColor]");
      expect(out).toContain("hover:bg-slate-50");
      expect(out).toContain("border-t border-slate-200/70");
      expect(out).not.toMatch(/bg-(blue|emerald|amber|red)-50/);
      expect(out).not.toContain("opacity-60");
    }
  });

  it("does nothing in the head", () => {
    expect(stripeRow("danger", "head")).not.toContain("shadow-");
  });
});
