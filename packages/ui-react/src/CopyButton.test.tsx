import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CopyButton } from "./CopyButton.js";

describe("CopyButton", () => {
  it("is named by the idle label, keeps the copied label hidden, and announces nothing before a click", () => {
    const out = renderToStaticMarkup(<CopyButton text="bun add" />);
    expect(out).toContain('aria-label="copy"');
    expect(out).toContain('<span data-copy-idle="" class="col-start-1 row-start-1">copy</span>');
    expect(out).toMatch(
      /<span data-copy-done="" aria-hidden="true" class="invisible [^"]*">copied<\/span>/,
    );
    expect(out).not.toContain('data-copied=""');
    expect(out).toContain('<span role="status" data-copy-status="" class="sr-only"></span>');
  });

  it("takes label and copiedLabel overrides", () => {
    const out = renderToStaticMarkup(<CopyButton text="x" label="Copy token" copiedLabel="Done" />);
    expect(out).toContain('aria-label="Copy token"');
    expect(out).toContain(">Copy token</span>");
    expect(out).toContain(
      'aria-hidden="true" class="invisible col-start-1 row-start-1">Done</span>',
    );
  });

  it("shows the copied label by a CSS animation on data-copied, with no timer", () => {
    const out = renderToStaticMarkup(<CopyButton text="x" />);
    expect(out).toContain("[data-copied] [data-copy-done]{animation:hc-copy-done 2s}");
    expect(out).toContain("@keyframes hc-copy-done{from,to{visibility:visible}}");
  });

  it("defaults to type=button and passes disabled through to the button", () => {
    const out = renderToStaticMarkup(<CopyButton text="x" disabled />);
    expect(out).toContain('type="button"');
    expect(out).toContain('disabled=""');
  });
});
