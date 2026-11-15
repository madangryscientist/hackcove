// @vitest-environment jsdom
import { CalendarDate } from "@internationalized/date";
import { createRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Checkbox } from "./Checkbox.js";
import { DateField } from "./DateField.js";
import { DateRangePicker } from "./DateRangePicker.js";
import { Disclosure } from "./Disclosure.js";
import { Field } from "./Field.js";
import { Input } from "./Input.js";
import { Radio, RadioGroup } from "./RadioGroup.js";
import { render, screen, user } from "./render.harness.js";
import { Select } from "./Select.js";
import { Switch } from "./Switch.js";
import { Textarea } from "./Textarea.js";

// One way to set each thing across the controls: `checked` or `defaultChecked` with
// `onChange(checked)`, `hint` and `error` on every labelled control, `disabled` and `required`
// rather than React Aria's names, and a `<thing>Label` for every built-in word.

describe("Checkbox and Switch take one value shape", () => {
  it("a Checkbox reports the new state, not the event", async () => {
    const onChange = vi.fn<(checked: boolean) => void>();
    render(<Checkbox label="Weekly summary" onChange={onChange} />);
    await user().click(screen.getByRole("checkbox", { name: "Weekly summary" }));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("a Switch with defaultChecked holds its own state", async () => {
    const onChange = vi.fn<(checked: boolean) => void>();
    render(<Switch label="Live" defaultChecked onChange={onChange} />);
    const control = screen.getByRole("switch", { name: "Live" });
    expect(control.getAttribute("aria-checked")).toBe("true");
    await user().click(control);
    expect(onChange).toHaveBeenCalledWith(false);
    expect(control.getAttribute("aria-checked")).toBe("false");
  });

  it("a controlled Switch shows the value it is given", async () => {
    render(<Switch label="Live" checked={false} onChange={() => undefined} />);
    const control = screen.getByRole("switch", { name: "Live" });
    await user().click(control);
    expect(control.getAttribute("aria-checked")).toBe("false");
  });
});

describe("error on a Checkbox and a Switch", () => {
  it("marks the Checkbox invalid and describes it with the error, in place of the hint", () => {
    render(<Checkbox label="Terms" hint="Read them first." error="Accept the terms." />);
    const box = screen.getByRole("checkbox", { name: /^Terms/, description: "Accept the terms." });
    expect(box.getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByRole("alert").textContent).toBe("Accept the terms.");
    expect(screen.queryByText("Read them first.")).toBeNull();
  });

  it("marks the Switch invalid and describes it with the error", () => {
    render(<Switch label="Live" error="Deploy first." />);
    const control = screen.getByRole("switch", { name: /^Live/, description: "Deploy first." });
    expect(control.getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByRole("alert").textContent).toBe("Deploy first.");
  });

  it("leaves a control with no error valid", () => {
    render(<Checkbox label="Terms" />);
    expect(screen.getByRole("checkbox", { name: "Terms" }).hasAttribute("aria-invalid")).toBe(
      false,
    );
  });
});

const group = (props: Partial<Parameters<typeof RadioGroup>[0]>) =>
  render(
    <RadioGroup label="Scope" {...props}>
      <Radio value="file" label="This file" />
      <Radio value="all" label="Everything" />
    </RadioGroup>,
  );

describe("RadioGroup takes disabled, required and hint", () => {
  it("disabled disables every radio", () => {
    group({ disabled: true });
    for (const radio of screen.getAllByRole<HTMLInputElement>("radio")) {
      expect(radio.disabled).toBe(true);
    }
  });

  it("required marks the radios required", () => {
    group({ required: true });
    for (const radio of screen.getAllByRole<HTMLInputElement>("radio")) {
      expect(radio.required).toBe(true);
    }
  });

  it("hint describes the group", () => {
    group({ hint: "Where to search." });
    expect(
      screen.getByRole("radiogroup", { name: "Scope", description: "Where to search." }),
    ).not.toBeNull();
  });
});

describe("the date fields take disabled and required", () => {
  it("disabled disables a DateField's segments", () => {
    render(<DateField aria-label="Date" disabled />);
    for (const segment of screen.getAllByRole("spinbutton")) {
      expect(segment.getAttribute("aria-disabled")).toBe("true");
    }
  });

  it("required marks a DateRangePicker's segments required", () => {
    render(<DateRangePicker aria-label="Period" required />);
    for (const segment of screen.getAllByRole("spinbutton")) {
      expect(segment.getAttribute("aria-required")).toBe("true");
    }
  });
});

function Driven() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Show details
      </button>
      <Disclosure summary="Details" open={open} onOpenChange={setOpen}>
        The body
      </Disclosure>
    </>
  );
}

describe("Disclosure open and onOpenChange", () => {
  it("shows the body when the app sets open", async () => {
    render(<Driven />);
    const summary = screen.getByRole("button", { name: "Details" });
    expect(summary.getAttribute("aria-expanded")).toBe("false");
    await user().click(screen.getByRole("button", { name: "Show details" }));
    expect(summary.getAttribute("aria-expanded")).toBe("true");
  });

  it("reports a press and stays as the app holds it", async () => {
    const onOpenChange = vi.fn<(open: boolean) => void>();
    render(
      <Disclosure summary="Details" open={false} onOpenChange={onOpenChange}>
        The body
      </Disclosure>,
    );
    const summary = screen.getByRole("button", { name: "Details" });
    await user().click(summary);
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(summary.getAttribute("aria-expanded")).toBe("false");
  });
});

describe("every built-in word has a label prop", () => {
  it("clearLabel names a search field's clear button", () => {
    render(<Input type="search" aria-label="Search" clearLabel="Wis" defaultValue="tea" />);
    expect(screen.getByRole("button", { name: "Wis" })).not.toBeNull();
  });

  it("the clear button is called Clear search by default", () => {
    render(<Input type="search" aria-label="Search" defaultValue="tea" />);
    expect(screen.getByRole("button", { name: "Clear search" })).not.toBeNull();
  });

  it("monthLabel and yearLabel name a calendar's dropdowns", () => {
    render(
      <DateField
        calendar
        aria-label="Datum"
        defaultOpen
        monthLabel="Maand"
        yearLabel="Jaar"
        defaultValue={new CalendarDate(1990, 5, 17)}
      />,
    );
    expect(screen.getByRole("combobox", { name: "Maand" })).not.toBeNull();
    expect(screen.getByRole("combobox", { name: "Jaar" })).not.toBeNull();
  });

  it("a DateRangePicker takes them too", () => {
    render(
      <DateRangePicker aria-label="Periode" defaultOpen monthLabel="Maand" yearLabel="Jaar" />,
    );
    expect(screen.getByRole("combobox", { name: "Maand" })).not.toBeNull();
    expect(screen.getByRole("combobox", { name: "Jaar" })).not.toBeNull();
  });
});

describe("ref reaches the native control", () => {
  it("on an Input, a search Input, a Select and a Textarea", () => {
    const input = createRef<HTMLInputElement>();
    const search = createRef<HTMLInputElement>();
    const select = createRef<HTMLSelectElement>();
    const area = createRef<HTMLTextAreaElement>();
    render(
      <>
        <Input aria-label="Name" ref={input} />
        <Input type="search" aria-label="Search" ref={search} />
        <Select aria-label="Plan" items={[{ value: "a", label: "A" }]} ref={select} />
        <Textarea aria-label="Notes" ref={area} />
      </>,
    );
    expect(input.current).toBe(screen.getByRole("textbox", { name: "Name" }));
    expect(search.current).toBe(screen.getByRole("searchbox", { name: "Search" }));
    expect(select.current).toBe(screen.getByRole("combobox", { name: "Plan" }));
    expect(area.current).toBe(screen.getByRole("textbox", { name: "Notes" }));
  });

  it("on a Checkbox", () => {
    const ref = createRef<HTMLInputElement>();
    render(<Checkbox label="Terms" ref={ref} />);
    expect(ref.current).toBe(screen.getByRole("checkbox", { name: "Terms" }));
  });
});

describe("Select items", () => {
  it("offers one option per item, and a disabled item cannot be chosen", () => {
    render(
      <Field label="Plan">
        <Select
          items={[
            { value: "free", label: "Free" },
            { value: "team", label: "Team", disabled: true },
          ]}
        />
      </Field>,
    );
    expect(screen.getByRole("combobox", { name: "Plan" })).not.toBeNull();
    expect(screen.getByRole<HTMLOptionElement>("option", { name: "Free" }).disabled).toBe(false);
    expect(screen.getByRole<HTMLOptionElement>("option", { name: "Team" }).disabled).toBe(true);
  });
});

describe("Field labelHidden", () => {
  it("still names the control", () => {
    render(
      <Field label="Email" labelHidden>
        <Input />
      </Field>,
    );
    expect(screen.getByRole("textbox", { name: "Email" })).not.toBeNull();
  });
});
