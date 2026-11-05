import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Card } from "./Card.js";
import { ListRow } from "./ListRow.js";

describe("ListRow compact bordered list", () => {
  it("is a Card flush around static size=sm rows: bordered, divided, no hover fill or click target", () => {
    const out = renderToStaticMarkup(
      <Card flush>
        <ListRow static size="sm" trailing="R 1 200">
          Groceries
        </ListRow>
        <ListRow static size="sm" divided trailing="R 640">
          Household
        </ListRow>
      </Card>,
    );
    expect(out).toContain("border-slate-200/70");
    expect(out).toContain("overflow-hidden");
    expect(out).toContain("px-3 py-2");
    expect(out).toContain("border-t border-slate-200/70");
    expect(out.match(/border-t/g)).toHaveLength(1);
    expect(out).not.toContain("<button");
    expect(out).not.toContain("hover:bg-slate-50");
    expect(out).toContain(">R 640</span>");
  });
});
