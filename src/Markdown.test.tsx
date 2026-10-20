import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Markdown } from "./Markdown.js";

const html = (md: string) => renderToStaticMarkup(<Markdown md={md} />);

describe("Markdown", () => {
  it("renders headings, bullets and paragraphs", () => {
    const out = html("## Done\n- one\n* two\n\n### Next\nplain");
    expect(out).toContain("<h2");
    expect(out).toContain(">Done</h2>");
    expect(out).toContain("<h3");
    expect(out).toContain(">Next</h3>");
    expect(out.match(/<li/g)).toHaveLength(2);
    expect(out).toContain(">plain</span></p>");
  });

  it("groups consecutive bullets into one list and starts a new one after a break", () => {
    const out = html("- a\n- b\n\n- c");
    expect(out.match(/<ul/g)).toHaveLength(2);
  });

  it("renders **bold** as strong", () => {
    expect(html("- **CUE-1** shipped")).toContain("<strong");
  });

  it("never injects HTML from the input", () => {
    const out = html("<script>alert(1)</script>");
    expect(out).not.toContain("<script");
    expect(out).toContain("&lt;script&gt;");
  });
});
