import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ListRow } from "./ListRow.js";

const html = (node: React.ReactElement) => renderToStaticMarkup(node);

describe("ListRow detail", () => {
  it("puts the detail under the row's line, in the label's column, inside the row", () => {
    const out = html(
      <ListRow static leading="L" trailing="3" detail={<p>Thread</p>}>
        Chat
      </ListRow>,
    );
    expect(out).toContain("grid-cols-[auto_minmax(0,1fr)]");
    expect(out).toContain("col-start-2");
    expect(out).toContain('<div class="min-w-0 col-start-2"><p>Thread</p></div>');
    // The label, trailing content and actions share one line; leading stands beside both.
    expect(out.indexOf("L</span>")).toBeLessThan(out.indexOf("Chat"));
    expect(out.indexOf("Chat")).toBeLessThan(out.indexOf("Thread"));
    expect(out.match(/<div class="group\/row/g)).toHaveLength(1);
  });

  it("without leading the detail has the whole row's width", () => {
    const out = html(
      <ListRow static detail="Thread">
        Chat
      </ListRow>,
    );
    expect(out).toContain("grid-cols-[minmax(0,1fr)]");
    expect(out).not.toContain("col-start-2");
  });

  it("keeps the line, the fill and the hairline on the whole row, detail included", () => {
    const out = html(
      <ListRow
        static
        divided
        revealOnHover
        actions={<button type="button">Hide</button>}
        detail="T"
      >
        Chat
      </ListRow>,
    );
    expect(out.match(/border-t border-slate-200\/70/g)).toHaveLength(1);
    expect(out).toContain("hover:bg-slate-50");
    expect(out).toContain("group-hover/row:opacity-100");
    expect(out.indexOf("Hide")).toBeLessThan(out.indexOf(">T<"));
  });

  it("a row without detail keeps its single flex line", () => {
    const out = html(
      <ListRow static leading="L">
        Chat
      </ListRow>,
    );
    expect(out).toContain("flex w-full items-center gap-3");
    expect(out).not.toContain("grid");
  });

  it("a nullish detail is no detail", () => {
    expect(
      html(
        <ListRow static detail={null}>
          Chat
        </ListRow>,
      ),
    ).not.toContain("grid");
    expect(
      html(
        <ListRow static detail={false}>
          Chat
        </ListRow>,
      ),
    ).not.toContain("grid");
  });
});
