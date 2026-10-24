import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Code } from "./Code.js";

describe("Code", () => {
  it("renders an inline code element in mono on the inset background", () => {
    const out = renderToStaticMarkup(<Code>bun install</Code>);
    expect(out.startsWith("<code")).toBe(true);
    expect(out).toContain("font-mono");
    expect(out).toContain("bg-slate-100");
    expect(out).toContain(">bun install</code>");
  });

  it("appends caller classes and forwards props", () => {
    const out = renderToStaticMarkup(
      <Code className="mx-1" title="command">
        x
      </Code>,
    );
    expect(out).toContain(" mx-1");
    expect(out).toContain('title="command"');
  });
});
