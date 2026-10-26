import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CopyLine } from "./CopyLine.js";

describe("CopyLine", () => {
  it("shows the text in a <code> with a copy button beside it", () => {
    const out = renderToStaticMarkup(<CopyLine text="bun add @hackcove/ui" />);
    expect(out).toContain("<code");
    expect(out).toContain("bun add @hackcove/ui</code>");
    expect(out).toContain(">copy</button>");
  });

  it("passes data-testid and other div props to the root, not the <code>", () => {
    const out = renderToStaticMarkup(<CopyLine text="x" data-testid="install-line" />);
    expect(out).toMatch(/<div[^>]*data-testid="install-line"/);
    expect(out).toContain('<code class="min-w-0 break-words">x</code>');
  });

  it("disables its copy button with disabled, and only the button", () => {
    const off = renderToStaticMarkup(<CopyLine text="x" disabled />);
    expect(off).toMatch(/<button[^>]*disabled=""/);
    expect(off).not.toMatch(/<div[^>]*disabled/);
    expect(renderToStaticMarkup(<CopyLine text="x" />)).not.toContain('disabled=""');
  });
});
