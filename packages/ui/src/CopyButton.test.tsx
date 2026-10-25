import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CopyButton } from "./CopyButton.js";

describe("CopyButton", () => {
  it("shows the idle label by default and never the copied one before a click", () => {
    const out = renderToStaticMarkup(<CopyButton text="bun add" />);
    expect(out).toContain(">copy</button>");
    expect(out).not.toContain("copied");
  });

  it("takes label and copiedLabel overrides", () => {
    const out = renderToStaticMarkup(<CopyButton text="x" label="Copy token" copiedLabel="Done" />);
    expect(out).toContain(">Copy token</button>");
  });

  it("defaults to type=button and passes disabled through to the button", () => {
    const out = renderToStaticMarkup(<CopyButton text="x" disabled />);
    expect(out).toContain('type="button"');
    expect(out).toContain('disabled=""');
  });
});
