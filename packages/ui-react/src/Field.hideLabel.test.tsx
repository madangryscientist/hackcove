// @vitest-environment jsdom
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";
import { mount, unmount } from "./dom.harness.js";
import { Field } from "./Field.js";

afterEach(unmount);

const search = (layout?: "row") => (
  <Field label="Search shops" htmlFor="q" hideLabel layout={layout} hint="Try a name.">
    <input id="q" />
  </Field>
);

describe("Field hideLabel", () => {
  it("keeps the label in the page, tied to the control, and hides only its text", () => {
    const root = mount(search());
    const label = root.querySelector("label");
    expect(label?.textContent).toBe("Search shops");
    expect(label?.control).toBe(root.querySelector("input"));
    expect(label?.className).toBe("sr-only");
  });

  it("draws a visible label when it is off", () => {
    const out = renderToStaticMarkup(
      <Field label="Search shops" htmlFor="q">
        <input id="q" />
      </Field>,
    );
    expect(out).not.toContain("sr-only");
  });

  it("draws layout=row as a column: no empty label column", () => {
    const out = renderToStaticMarkup(search("row"));
    expect(out).not.toContain("grid-cols-[8rem_1fr]");
    expect(out).toContain("flex flex-col");
    expect(out).not.toContain("col-start-2");
    expect(out).toContain(">Try a name.</p>");
  });
});
