// @vitest-environment jsdom
import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";
import { Checkbox } from "./Checkbox.js";
import { Field } from "./Field.js";
import { FileDrop } from "./FileDrop.js";
import { Input } from "./Input.js";
import { render, screen } from "./render.harness.js";
import { Select } from "./Select.js";
import { Textarea } from "./Textarea.js";

type ControlA11y = { id?: string; "aria-describedby"?: string; "aria-invalid"?: boolean };

/** Every control that reads the Field, drawn with the given props on its native element. */
const controls: { name: string; draw: (props: ControlA11y) => ReactElement }[] = [
  { name: "Input", draw: (props) => <Input {...props} /> },
  { name: "Input icon", draw: (props) => <Input {...props} icon="search" /> },
  { name: "Input prefix", draw: (props) => <Input {...props} prefix="R" /> },
  { name: "Input search", draw: (props) => <Input {...props} type="search" /> },
  {
    name: "Select",
    draw: (props) => <Select {...props} items={[{ value: "one", label: "One" }]} />,
  },
  { name: "Textarea", draw: (props) => <Textarea {...props} /> },
  { name: "FileDrop", draw: (props) => <FileDrop {...props}>Drop a file</FileDrop> },
];

const LABEL = "Display name";
const ERROR = "Pick a shorter name.";
const HINT = "Shown on your reviews.";

/** The control the Field's label names. */
function control(): HTMLElement {
  return screen.getByLabelText(LABEL, { exact: false });
}

/** The text of every element the control's `aria-describedby` names, in order. */
function description(element: HTMLElement): string[] {
  const ids = element.getAttribute("aria-describedby")?.split(" ") ?? [];
  return ids.map((id) => document.getElementById(id)?.textContent ?? `<no element #${id}>`);
}

describe.each(controls)("$name inside a Field", ({ draw }) => {
  it("is named by the label with no htmlFor and no id", () => {
    render(<Field label={LABEL}>{draw({})}</Field>);
    expect(screen.getByLabelText(LABEL)).toBe(control());
  });

  it("is invalid and described by the error", () => {
    render(
      <Field label={LABEL} error={ERROR}>
        {draw({})}
      </Field>,
    );
    expect(control().getAttribute("aria-invalid")).toBe("true");
    expect(description(control())).toEqual([ERROR]);
  });

  it("is described by the hint alone, and not invalid", () => {
    render(
      <Field label={LABEL} hint={HINT}>
        {draw({})}
      </Field>,
    );
    expect(control().hasAttribute("aria-invalid")).toBe(false);
    expect(description(control())).toEqual([HINT]);
  });

  it("is described by the error alone when there is a hint too, and the hint is not drawn", () => {
    render(
      <Field label={LABEL} hint={HINT} error={ERROR}>
        {draw({})}
      </Field>,
    );
    expect(description(control())).toEqual([ERROR]);
    expect(screen.queryByText(HINT)).toBeNull();
  });

  it("has no aria-describedby with neither a hint nor an error", () => {
    render(<Field label={LABEL}>{draw({})}</Field>);
    expect(control().hasAttribute("aria-describedby")).toBe(false);
  });

  it("keeps the caller's aria-describedby first and adds the Field's note after it", () => {
    render(
      <>
        <p id="extra">Extra words.</p>
        <Field label={LABEL} error={ERROR}>
          {draw({ "aria-describedby": "extra" })}
        </Field>
      </>,
    );
    expect(description(control())).toEqual(["Extra words.", ERROR]);
  });

  it("keeps the caller's aria-invalid over the Field's", () => {
    render(
      <Field label={LABEL} error={ERROR}>
        {draw({ "aria-invalid": false })}
      </Field>,
    );
    expect(control().getAttribute("aria-invalid")).toBe("false");
  });

  it("is still named by a Field htmlFor matching its own id", () => {
    render(
      <Field label={LABEL} htmlFor="x">
        {draw({ id: "x" })}
      </Field>,
    );
    expect(control().id).toBe("x");
  });

  it("takes the Field's htmlFor as its id when it has none", () => {
    render(
      <Field label={LABEL} htmlFor="x">
        {draw({})}
      </Field>,
    );
    expect(control().id).toBe("x");
  });

  it("is named by the label when it has its own id and the Field has no htmlFor", () => {
    render(<Field label={LABEL}>{draw({ id: "name" })}</Field>);
    expect(control()).toBeInstanceOf(HTMLElement);
  });
});

describe.each(controls)("$name outside a Field", ({ draw }) => {
  it("gets no id, aria-describedby or aria-invalid it was not given", () => {
    // A wrapping label names the control without giving it an id, as a consumer's own form might.
    render(<label>Bare {draw({})}</label>);
    const element = screen.getByLabelText("Bare", { exact: false });
    expect(element.hasAttribute("id")).toBe(false);
    expect(element.hasAttribute("aria-describedby")).toBe(false);
    expect(element.hasAttribute("aria-invalid")).toBe(false);
  });
});

describe("a control that does not read the Field", () => {
  it("leaves a Checkbox inside an errored Field without aria-invalid", () => {
    render(
      <Field label={LABEL} error={ERROR}>
        <Checkbox label="Open now" />
      </Field>,
    );
    expect(screen.getByRole("checkbox", { name: "Open now" }).hasAttribute("aria-invalid")).toBe(
      false,
    );
  });
});
