import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ButtonGroup } from "./ButtonGroup.js";

const html = renderToStaticMarkup;

describe("ButtonGroup", () => {
  it("is a wrapping row with a gap, and no role without a label", () => {
    const out = html(<ButtonGroup>x</ButtonGroup>);
    expect(out).toContain("flex flex-wrap");
    expect(out).toContain("gap-2");
    expect(out).not.toContain("role=");
    expect(out).not.toContain("ml-auto");
  });

  it("pushes the end item to the far side", () => {
    const out = html(
      <ButtonGroup end={<a href="/">Back</a>}>
        <button>Save</button>
      </ButtonGroup>,
    );
    expect(out).toMatch(/<button>Save<\/button><div class="ml-auto"><a href="\/">Back<\/a><\/div>/);
  });

  it("label makes it a named group", () => {
    const out = html(<ButtonGroup label="Quote actions">x</ButtonGroup>);
    expect(out).toContain('role="group"');
    expect(out).toContain('aria-label="Quote actions"');
  });

  it("appends className", () => {
    expect(html(<ButtonGroup className="mt-4">x</ButtonGroup>)).toContain("gap-2 mt-4");
  });
});
