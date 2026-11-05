import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Field } from "./Field.js";

const fieldWith = (span?: "full") =>
  renderToStaticMarkup(
    <Field label="Notes" htmlFor="notes" span={span}>
      <input id="notes" />
    </Field>,
  );

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

  it("spans every column of a FormGrid with span=full, and takes one otherwise", () => {
    expect(fieldWith("full")).toContain("col-span-full");
    expect(fieldWith()).not.toContain("col-span");
  });
});

const labelTrack = (out: string) => out.match(/grid-cols-\[[^\]]+\]/)?.[0];

const row = (extra: { hint?: string; error?: string } = {}) =>
  renderToStaticMarkup(
    <Field label="Rank" htmlFor="rank" layout="row" {...extra}>
      <input id="rank" />
    </Field>,
  );

describe("Field layout", () => {
  it("is a column by default", () => {
    expect(fieldWith()).toContain("flex flex-col");
    expect(fieldWith()).not.toContain("grid-cols");
  });

  it("puts the label beside the control with layout=row", () => {
    const out = row();
    expect(out).toContain("grid grid-cols-[8rem_1fr] items-center");
    expect(out).not.toContain("flex-col");
    expect(out).not.toContain("layout=");
    expect(out.indexOf("<label")).toBeLessThan(out.indexOf("<input"));
    expect(out).not.toContain("col-start-2");
  });

  it("gives every row the same label column, whatever the label says", () => {
    const short = renderToStaticMarkup(
      <Field label="Rank" htmlFor="a" layout="row">
        <input id="a" />
      </Field>,
    );
    const long = renderToStaticMarkup(
      <Field label="Notification frequency for shared projects" htmlFor="b" layout="row">
        <input id="b" />
      </Field>,
    );
    expect(labelTrack(short)).toBe("grid-cols-[8rem_1fr]");
    expect(labelTrack(long)).toBe(labelTrack(short));
    expect(long).toContain("min-w-0 wrap-anywhere");
  });

  it("keeps the hint or error under the control, in the second column", () => {
    expect(row({ hint: "Lower first." })).toContain(
      '<div class="col-start-2"><p class="text-xs text-slate-500">Lower first.</p></div>',
    );
    const err = row({ hint: "Lower first.", error: "Required." });
    expect(err).toContain('role="alert"');
    expect(err).not.toContain("Lower first.");
  });
});
