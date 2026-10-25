import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FormGrid, FormRow, FormRowField } from "./FormRow.js";

const shareOf = (span?: 1 | 2 | 3 | 4) =>
  renderToStaticMarkup(
    <FormRowField label="A" htmlFor="a" span={span}>
      <input id="a" />
    </FormRowField>,
  );

describe("FormRowField", () => {
  it("points a compact label at the control", () => {
    const out = renderToStaticMarkup(
      <FormRowField label="Amount" htmlFor="amount">
        <input id="amount" />
      </FormRowField>,
    );
    expect(out).toContain('<label for="amount" class="text-xs');
  });

  it("gives each span its own share, one by default", () => {
    expect(shareOf()).toContain("md:flex-1");
    expect(shareOf(2)).toContain("md:flex-2");
    expect(shareOf(3)).toContain("md:flex-3");
    expect(shareOf(4)).toContain("md:flex-4");
  });
});

describe("FormRow", () => {
  const fields = (
    <FormRowField label="Name" htmlFor="name" span={2}>
      <input id="name" />
    </FormRowField>
  );

  it("stacks under md and sits side by side from md, controls on the bottom edge", () => {
    const out = renderToStaticMarkup(<FormRow>{fields}</FormRow>);
    expect(out).toContain("flex-col");
    expect(out).toContain("md:flex-row");
    expect(out).toContain("md:items-end");
  });

  it("puts the action after the fields, at its own width", () => {
    const out = renderToStaticMarkup(<FormRow action={<button>Save</button>}>{fields}</FormRow>);
    expect(out.indexOf("<button>Save</button>")).toBeGreaterThan(out.indexOf('id="name"'));
    expect(out).toContain("md:shrink-0");
  });

  it("draws no action wrapper or note when neither is given", () => {
    const out = renderToStaticMarkup(<FormRow>{fields}</FormRow>);
    expect(out).not.toContain("md:shrink-0");
    expect(out).not.toContain("<p");
  });

  it("puts the hint under the whole row, after the last field", () => {
    const out = renderToStaticMarkup(
      <FormRow hint="Saved on enter." action={<button>Save</button>}>
        {fields}
      </FormRow>,
    );
    expect(out.indexOf("Saved on enter.")).toBeGreaterThan(out.indexOf("<button>Save</button>"));
    expect(out).not.toContain('role="alert"');
  });

  it("replaces the hint with an error that carries role=alert", () => {
    const out = renderToStaticMarkup(
      <FormRow hint="Saved on enter." error="Amount is required.">
        {fields}
      </FormRow>,
    );
    expect(out).toContain('role="alert"');
    expect(out).toContain(">Amount is required.</p>");
    expect(out).not.toContain("Saved on enter.");
  });

  it("spans the whole of a FormGrid", () => {
    expect(renderToStaticMarkup(<FormRow>{fields}</FormRow>)).toContain("col-span-full");
  });
});

describe("FormGrid", () => {
  it("is two columns from md and one below", () => {
    const out = renderToStaticMarkup(<FormGrid>x</FormGrid>);
    expect(out).toContain("grid-cols-1");
    expect(out).toContain("md:grid-cols-2");
  });
});
