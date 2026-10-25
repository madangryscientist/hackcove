import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { IconButton } from "./IconButton.js";

describe("IconButton", () => {
  it("names itself with label as both aria-label and title", () => {
    const out = renderToStaticMarkup(<IconButton label="Switch to dark theme">x</IconButton>);
    expect(out).toContain('aria-label="Switch to dark theme"');
    expect(out).toContain('title="Switch to dark theme"');
  });

  it("defaults to type=button and lets the caller override it", () => {
    expect(renderToStaticMarkup(<IconButton label="a">x</IconButton>)).toContain('type="button"');
    const submit = renderToStaticMarkup(
      <IconButton label="a" type="submit">
        x
      </IconButton>,
    );
    expect(submit).toContain('type="submit"');
  });
});
