import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { BulletList } from "./BulletList.js";

describe("BulletList", () => {
  it("renders a ul of discs with its li children", () => {
    const out = renderToStaticMarkup(
      <BulletList>
        <li>one</li>
        <li>two</li>
      </BulletList>,
    );
    expect(out).toMatch(/^<ul class="list-disc space-y-1 pl-5">/);
    expect(out).toContain("<li>one</li><li>two</li>");
  });

  it("forwards props", () => {
    const out = renderToStaticMarkup(
      <BulletList aria-label="Duties">
        <li>x</li>
      </BulletList>,
    );
    expect(out).toContain('aria-label="Duties"');
  });
});
