import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Field } from "./Field.js";

describe("Field", () => {
  it("points the label at the control through htmlFor", () => {
    const out = renderToStaticMarkup(
      <Field label="Name" htmlFor="name">
        <input id="name" />
      </Field>,
    );
    expect(out).toContain('<label for="name"');
    expect(out).toContain(">Name</label>");
  });

  it("shows the hint when there is no error", () => {
    const out = renderToStaticMarkup(
      <Field label="Name" htmlFor="name" hint="Shown on your reviews.">
        <input id="name" />
      </Field>,
    );
    expect(out).toContain(">Shown on your reviews.</p>");
    expect(out).not.toContain('role="alert"');
  });

  it("replaces the hint with an error that carries role=alert", () => {
    const out = renderToStaticMarkup(
      <Field label="Name" htmlFor="name" hint="Shown on your reviews." error="Pick a shorter name.">
        <input id="name" />
      </Field>,
    );
    expect(out).toContain('role="alert"');
    expect(out).toContain(">Pick a shorter name.</p>");
    expect(out).not.toContain("Shown on your reviews.");
  });

  it("renders no hint paragraph when neither hint nor error is given", () => {
    const out = renderToStaticMarkup(
      <Field label="Name" htmlFor="name">
        <input id="name" />
      </Field>,
    );
    expect(out).not.toContain("<p");
  });

  it("appends className after the base classes", () => {
    const out = renderToStaticMarkup(
      <Field label="Name" htmlFor="name" className="max-w-xs">
        <input id="name" />
      </Field>,
    );
    expect(out).toContain('class="flex flex-col gap-1.5 max-w-xs"');
  });
});
