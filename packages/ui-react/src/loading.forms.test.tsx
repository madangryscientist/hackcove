// @vitest-environment jsdom
import type { ReactNode } from "react";
import { isInaccessible, queryAllByAttribute } from "@testing-library/dom";
import { describe, expect, it } from "vitest";
import { Checkbox } from "./Checkbox.js";
import { DateField } from "./DateField.js";
import { Field } from "./Field.js";
import { FormRow, FormRowField } from "./FormRow.js";
import { Input } from "./Input.js";
import { Radio, RadioGroup } from "./RadioGroup.js";
import { render, screen } from "./render.harness.js";
import { LoadingScope } from "./skeleton.js";
import { Switch } from "./Switch.js";

/** The bones on the page, by the marker each one renders: every one hidden from assistive tech. */
function bones(): HTMLElement[] {
  const found = queryAllByAttribute("data-skeleton", document.body, "");
  for (const bone of found) expect(isInaccessible(bone)).toBe(true);
  return found;
}

const busyRoots = (): HTMLElement[] => queryAllByAttribute("aria-busy", document.body, "true");

/** Each form part, its label "Delivery", with `loading` as given. */
const parts: Record<string, (loading?: boolean) => ReactNode> = {
  Field: (loading) => (
    <Field label="Delivery" loading={loading}>
      <Input defaultValue="Friday" />
    </Field>
  ),
  FormRowField: (loading) => (
    <FormRow>
      <FormRowField label="Delivery" htmlFor="delivery" loading={loading}>
        <Input id="delivery" defaultValue="Friday" />
      </FormRowField>
    </FormRow>
  ),
  Checkbox: (loading) => <Checkbox label="Delivery" loading={loading} />,
  Switch: (loading) => <Switch label="Delivery" loading={loading} />,
  RadioGroup: (loading) => (
    <RadioGroup label="Delivery" loading={loading}>
      <Radio label="Friday" value="fri" />
      <Radio label="Monday" value="mon" />
    </RadioGroup>
  ),
  DateField: (loading) => <DateField label="Delivery" loading={loading} />,
};

describe("loading form parts", () => {
  for (const [name, part] of Object.entries(parts)) {
    it(`${name}: the label is drawn, the control is a bone, the owner busy with one label`, () => {
      render(part(true));
      expect(screen.getByText("Delivery")).toBeTruthy();
      expect(bones().length).toBeGreaterThan(0);
      expect(screen.queryByRole("textbox")).toBeNull();
      expect(screen.queryByRole("checkbox")).toBeNull();
      expect(screen.queryByRole("switch")).toBeNull();
      expect(screen.queryByRole("radio")).toBeNull();
      expect(busyRoots()).toHaveLength(1);
      expect(screen.getAllByText("Loading")).toHaveLength(1);
    });

    it(`${name}: draws as today with loading false, and inherits a loading ancestor`, () => {
      const off = render(<LoadingScope loading>{part(false)}</LoadingScope>);
      expect(bones()).toHaveLength(0);
      off.unmount();
      render(<LoadingScope loading>{part()}</LoadingScope>);
      expect(bones().length).toBeGreaterThan(0);
      expect(busyRoots()).toHaveLength(0);
      expect(screen.queryByText("Loading")).toBeNull();
    });
  }

  it("a radio group keeps each option's label, a bone for each circle", () => {
    render(parts["RadioGroup"]?.(true));
    expect(screen.getByText("Friday")).toBeTruthy();
    expect(screen.getByText("Monday")).toBeTruthy();
    expect(bones()).toHaveLength(2);
  });

  it("loadingLabel replaces the announcement", () => {
    render(<Checkbox label="Delivery" loading loadingLabel="Laai" />);
    expect(screen.getByText("Laai")).toBeTruthy();
    expect(screen.queryByText("Loading")).toBeNull();
  });
});
