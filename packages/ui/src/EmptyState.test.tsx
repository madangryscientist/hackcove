import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { EmptyState } from "./EmptyState.js";

describe("EmptyState", () => {
  it("is a section named by its title heading", () => {
    const out = renderToStaticMarkup(<EmptyState title="No builds yet" />);
    const id = out.match(/aria-labelledby="([^"]+)"/)?.[1];
    expect(out).toMatch(/^<section /);
    expect(id).toBeTruthy();
    expect(out).toContain(`<h2 id="${id}"`);
    expect(out).toContain("No builds yet");
  });

  it("draws the children under the title and the actions after them, in a centred row", () => {
    const out = renderToStaticMarkup(
      <EmptyState title="T" actions={<button type="button">Create</button>}>
        <p>Explain.</p>
      </EmptyState>,
    );
    expect(out.indexOf("T</h2>")).toBeLessThan(out.indexOf("Explain."));
    expect(out.indexOf("Explain.")).toBeLessThan(out.indexOf("Create"));
    expect(out).toMatch(/<div class="[^"]*justify-center[^"]*"><button/);
  });

  it("leaves out the body and the action row when there are none", () => {
    const out = renderToStaticMarkup(<EmptyState title="T" />);
    expect(out.match(/<div/g)).toBeNull();
  });
});
