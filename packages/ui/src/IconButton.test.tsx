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

  it("is the bordered outline by default, byte for byte", () => {
    const out = renderToStaticMarkup(<IconButton label="a">x</IconButton>);
    expect(out).toContain("border-slate-200 text-slate-500 hover:bg-slate-50");
    expect(out).not.toContain("danger");
  });

  it("ghost has no border until the hover fill", () => {
    const out = renderToStaticMarkup(
      <IconButton label="a" variant="ghost">
        x
      </IconButton>,
    );
    expect(out).toContain("border-transparent");
    expect(out).toContain("hover:bg-slate-100");
    expect(out).not.toContain("border-slate-200");
  });

  it("danger is red on both variants and drops the neutral colours", () => {
    const outline = renderToStaticMarkup(
      <IconButton label="a" tone="danger">
        x
      </IconButton>,
    );
    expect(outline).toContain("border-red-200 text-red-700 hover:bg-red-50");
    expect(outline).not.toContain("slate-500");
    const ghost = renderToStaticMarkup(
      <IconButton label="a" tone="danger" variant="ghost">
        x
      </IconButton>,
    );
    expect(ghost).toContain("border-transparent text-red-700 hover:bg-red-50");
    expect(ghost).not.toContain("border-red-200");
  });
});
