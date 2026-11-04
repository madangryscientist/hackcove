// @vitest-environment jsdom
import { CalendarDate } from "@internationalized/date";
import { act, useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { errorOf, leave, posted, segmentsOf, textOf, type } from "./date.harness.js";
import { DateField } from "./DateField.js";
import { mount, unmount } from "./dom.harness.js";

/** A parent that stores what the field reports and passes it back. */
function Controlled({
  Field,
  onChange,
  initial,
  ...range
}: {
  Field: typeof DateField;
  onChange: (date: CalendarDate | null) => void;
  initial: CalendarDate;
  minValue?: CalendarDate;
  maxValue?: CalendarDate;
}) {
  const [value, setValue] = useState<CalendarDate | null>(initial);
  return (
    <Field
      aria-label="Date"
      name="dob"
      {...range}
      value={value}
      onChange={(date) => {
        onChange(date);
        setValue(date);
      }}
    />
  );
}

/**
 * A parent that sets the value itself: a date, then a reset to null. Its `onChange` is a new
 * function every render, as an inline handler is.
 */
function Parent({
  Field,
  onChange,
}: {
  Field: typeof DateField;
  onChange: (date: CalendarDate | null) => void;
}) {
  const [value, setValue] = useState<CalendarDate | null>(new CalendarDate(1990, 5, 17));
  return (
    <>
      <Field
        aria-label="Date"
        name="dob"
        value={value}
        onChange={(date) => {
          onChange(date);
          setValue(date);
        }}
      />
      <button type="button" onClick={() => setValue(new CalendarDate(2001, 1, 2))}>
        Set
      </button>
      <button type="button" onClick={() => setValue(null)}>
        Reset
      </button>
    </>
  );
}

beforeEach(() => {
  // A US browser: the field must still read DD/MM/YYYY.
  vi.spyOn(navigator, "language", "get").mockReturnValue("en-US");
  vi.spyOn(navigator, "languages", "get").mockReturnValue(["en-US"]);
  document.documentElement.lang = "en-US";
});
afterEach(() => {
  unmount();
  vi.restoreAllMocks();
  document.documentElement.lang = "";
});

describe.each([
  ["DateField", DateField],
  ["DateField calendar", ((props) => <DateField {...props} calendar />) as typeof DateField],
])("%s reports what it shows", (_component, Field) => {
  const birthday = new CalendarDate(1990, 5, 17);

  it("reports null once when a valid date is edited into an impossible one", () => {
    const onChange = vi.fn<(date: CalendarDate | null) => void>();
    const container = mount(<Controlled Field={Field} onChange={onChange} initial={birthday} />);
    const [day] = segmentsOf(container);
    if (!day) throw new Error("no day segment");
    type(day, "3102");
    leave();
    // 03/05 and 31/05 on the way are real dates; the impossible one reports null, once.
    expect(onChange.mock.calls.map(([date]) => date?.toString() ?? null)).toEqual([
      "1990-05-03",
      "1990-05-31",
      null,
    ]);
    expect(posted(container)).toBe("");
    expect(textOf(container)).toEqual(["31", "02", "1990"]);
    expect(errorOf(container)).toBe("February 1990 has 28 days.");
  });

  it("reports the date again once it is fixed", () => {
    const onChange = vi.fn<(date: CalendarDate | null) => void>();
    const container = mount(<Controlled Field={Field} onChange={onChange} initial={birthday} />);
    const [day] = segmentsOf(container);
    if (!day) throw new Error("no day segment");
    type(day, "3102");
    type(day, "28");
    leave();
    expect(onChange.mock.calls.at(-1)?.[0]?.toString()).toBe("1990-02-28");
    expect(posted(container)).toBe("1990-02-28");
    expect(errorOf(container)).toBe("");
  });

  it("shows a value the parent sets, a reset to null included, and reports none of it", () => {
    const onChange = vi.fn<(date: CalendarDate | null) => void>();
    const container = mount(<Parent Field={Field} onChange={onChange} />);
    const press = (text: string) => {
      const button = Array.from(container.querySelectorAll("button")).find(
        (b) => b.textContent === text,
      );
      if (!button) throw new Error(`no ${text} button`);
      act(() => button.click());
    };
    press("Set");
    expect(textOf(container)).toEqual(["02", "01", "2001"]);
    expect(posted(container)).toBe("2001-01-02");
    press("Reset");
    expect(textOf(container)).toEqual(["DD", "MM", "YYYY"]);
    expect(posted(container)).toBe("");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("does not report null for an out-of-range value the parent loads after mount", () => {
    const onChange = vi.fn<(date: CalendarDate | null) => void>();
    function Loader() {
      const [value, setValue] = useState<CalendarDate | null>(null);
      return (
        <>
          <Field
            aria-label="Date"
            name="dob"
            maxValue={new CalendarDate(2000, 1, 1)}
            value={value}
            onChange={onChange}
          />
          <button type="button" onClick={() => setValue(new CalendarDate(2050, 1, 2))}>
            Load
          </button>
        </>
      );
    }
    const container = mount(<Loader />);
    const load = Array.from(container.querySelectorAll("button")).find(
      (b) => b.textContent === "Load",
    );
    act(() => load?.click());
    expect(textOf(container)).toEqual(["02", "01", "2050"]);
    expect(posted(container)).toBe("");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("blocks a form submit when a required date is only partly filled", () => {
    const container = mount(
      <form>
        <Field aria-label="Date" name="dob" isRequired defaultValue={birthday} />
      </form>,
    );
    const form = container.querySelector("form");
    const year = segmentsOf(container)[2];
    if (!form || !year) throw new Error("no form or year segment");
    expect(form.checkValidity()).toBe(true);
    act(() => year.focus());
    for (let i = 0; i < 4; i += 1) {
      act(() => {
        year.dispatchEvent(
          new InputEvent("beforeinput", {
            inputType: "deleteContentBackward",
            bubbles: true,
            cancelable: true,
          }),
        );
      });
    }
    expect(errorOf(container)).toBe("");
    leave();
    expect(textOf(container)).toEqual(["17", "05", "YYYY"]);
    expect(posted(container)).toBe("");
    expect(form.checkValidity()).toBe(false);
    expect(errorOf(container)).toBe("Enter the whole date.");
  });

  it.each([
    ["before minValue", "1999"],
    ["after maxValue", "2001"],
  ])("reports null once when a valid date is edited %s", (_case, year) => {
    const onChange = vi.fn<(date: CalendarDate | null) => void>();
    const container = mount(
      <Controlled
        Field={Field}
        onChange={onChange}
        initial={new CalendarDate(2000, 5, 17)}
        minValue={new CalendarDate(2000, 1, 1)}
        maxValue={new CalendarDate(2000, 12, 31)}
      />,
    );
    const yearSegment = segmentsOf(container)[2];
    if (!yearSegment) throw new Error("no year segment");
    type(yearSegment, year);
    leave();
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith(null);
    expect(posted(container)).toBe("");
    expect(textOf(container)).toEqual(["17", "05", year]);
    expect(container.querySelector('[data-invalid="true"]')).not.toBeNull();
    expect(errorOf(container)).not.toBe("");
  });
});
