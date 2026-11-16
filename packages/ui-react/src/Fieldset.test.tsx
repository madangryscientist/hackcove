// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { Checkbox } from "./Checkbox.js";
import { Field } from "./Field.js";
import { Fieldset } from "./Fieldset.js";
import { Input } from "./Input.js";
import { render, screen, user } from "./render.harness.js";

const LABEL = "What is wrong?";
const group = () => screen.getByRole("group", { name: LABEL });

/** The text of every element the group's `aria-describedby` names, in order. */
function description(element: HTMLElement): string[] {
  const ids = element.getAttribute("aria-describedby")?.split(" ") ?? [];
  return ids.map((id) => document.getElementById(id)?.textContent ?? `missing #${id}`);
}

const boxes = (
  <>
    <Checkbox label="Wrong hours" />
    <Checkbox label="Closed for good" />
  </>
);

describe("Fieldset", () => {
  it("is a group named by its label", () => {
    render(<Fieldset label={LABEL}>{boxes}</Fieldset>);
    expect(group()).not.toBeNull();
  });

  it("is described by its hint", () => {
    render(
      <Fieldset label={LABEL} hint="Tick all that apply.">
        {boxes}
      </Fieldset>,
    );
    expect(description(group())).toEqual(["Tick all that apply."]);
  });

  it("is described by its error alone, an alert in place of the hint", () => {
    render(
      <Fieldset label={LABEL} hint="Tick all that apply." error="Pick at least one.">
        {boxes}
      </Fieldset>,
    );
    expect(description(group())).toEqual(["Pick at least one."]);
    expect(screen.getByRole("alert").textContent).toBe("Pick at least one.");
    expect(screen.queryByText("Tick all that apply.")).toBeNull();
    expect(group().hasAttribute("aria-invalid")).toBe(false);
  });

  it("has no aria-describedby with neither a hint nor an error", () => {
    render(<Fieldset label={LABEL}>{boxes}</Fieldset>);
    expect(group().hasAttribute("aria-describedby")).toBe(false);
  });

  it("keeps the caller's aria-describedby first and adds its note after it", () => {
    render(
      <>
        <p id="extra">Asked once a year.</p>
        <Fieldset label={LABEL} hint="Tick all that apply." aria-describedby="extra">
          {boxes}
        </Fieldset>
      </>,
    );
    expect(description(group())).toEqual(["Asked once a year.", "Tick all that apply."]);
  });

  it("disables every checkbox inside when disabled", async () => {
    render(
      <Fieldset label={LABEL} disabled>
        {boxes}
      </Fieldset>,
    );
    const box = screen.getByRole<HTMLInputElement>("checkbox", { name: "Wrong hours" });
    expect(box.matches(":disabled")).toBe(true);
    await user().click(box);
    expect(box.checked).toBe(false);
  });

  it("leaves a Field inside to name and describe its own control", () => {
    render(
      <Fieldset label="Opening hours" error="Fill in every day.">
        <Field label="Monday">
          <Input />
        </Field>
      </Fieldset>,
    );
    const monday = screen.getByRole("textbox", { name: "Monday" });
    expect(monday.hasAttribute("aria-invalid")).toBe(false);
    expect(monday.hasAttribute("aria-describedby")).toBe(false);
  });

  it("gives a bare Input inside no id or description", () => {
    render(
      <Fieldset label="Opening hours" hint="HH:MM">
        <Input aria-label="Monday" />
      </Fieldset>,
    );
    const monday = screen.getByRole("textbox", { name: "Monday" });
    expect(monday.hasAttribute("id")).toBe(false);
    expect(monday.hasAttribute("aria-describedby")).toBe(false);
  });
});
