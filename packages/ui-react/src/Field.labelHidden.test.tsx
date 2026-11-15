// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { Field } from "./Field.js";
import { render, screen } from "./render.harness.js";

const search = (layout?: "row") => (
  <Field label="Search shops" htmlFor="q" labelHidden layout={layout} hint="Try a name.">
    <input id="q" />
  </Field>
);

describe("Field labelHidden", () => {
  it("keeps the label in the page, naming the control", () => {
    render(search());
    expect(screen.getByLabelText("Search shops").id).toBe("q");
  });

  it("keeps the label naming the control with layout=row, and still shows the hint", () => {
    render(search("row"));
    expect(screen.getByLabelText("Search shops").id).toBe("q");
    expect(screen.getByText("Try a name.")).not.toBeNull();
  });
});
