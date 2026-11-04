// @vitest-environment jsdom
import { CalendarDate } from "@internationalized/date";
import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DateField } from "./DateField.js";
import { mount, unmount } from "./dom.harness.js";

import { errorOf, leave, segmentsOf, type } from "./date.harness.js";

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

describe("DateField", () => {
  it("shows DD, MM and YYYY placeholders in day-month-year order", () => {
    const container = mount(<DateField label="Date of birth" />);
    expect(segmentsOf(container).map((s) => s.textContent)).toEqual(["DD", "MM", "YYYY"]);
    expect(container.textContent).toContain("Date of birth");
  });

  it("reads typed digits segment by segment as day, month, year", () => {
    const onChange = vi.fn<(date: CalendarDate | null) => void>();
    const container = mount(<DateField aria-label="Date" onChange={onChange} />);
    const [day] = segmentsOf(container);
    if (!day) throw new Error("no day segment");
    type(day, "17051990");
    expect(segmentsOf(container).map((s) => s.textContent)).toEqual(["17", "05", "1990"]);
    const last = onChange.mock.calls.at(-1)?.[0];
    expect(last?.compare(new CalendarDate(1990, 5, 17))).toBe(0);
  });

  it("shows a filled value as DD/MM/YYYY", () => {
    const container = mount(
      <DateField aria-label="Date" defaultValue={new CalendarDate(1990, 5, 7)} />,
    );
    expect(segmentsOf(container).map((s) => s.textContent)).toEqual(["07", "05", "1990"]);
  });

  it("flags an impossible date with how many days the month has", () => {
    const container = mount(<DateField aria-label="Date" />);
    const [day] = segmentsOf(container);
    if (!day) throw new Error("no day segment");
    type(day, "31021990");
    expect(errorOf(container)).toBe("February 1990 has 28 days.");
    expect(container.querySelector('[data-invalid="true"]')).not.toBeNull();
  });

  it("keeps an impossible date as typed when focus leaves, and never reports a clamped one", () => {
    const onChange = vi.fn<(date: CalendarDate | null) => void>();
    const container = mount(<DateField aria-label="Date" name="dob" onChange={onChange} />);
    const [day] = segmentsOf(container);
    if (!day) throw new Error("no day segment");
    type(day, "31021990");
    leave();
    expect(segmentsOf(container).map((s) => s.textContent)).toEqual(["31", "02", "1990"]);
    expect(errorOf(container)).toBe("February 1990 has 28 days.");
    expect(container.querySelector('[data-invalid="true"]')).not.toBeNull();
    expect(onChange).not.toHaveBeenCalled();
    expect(container.querySelector<HTMLInputElement>('input[name="dob"]')?.value).toBe("");
  });

  it.each([
    ["before minValue", "01061999"],
    ["after maxValue", "01062001"],
  ])("flags a typed date %s", (_, digits) => {
    const container = mount(
      <DateField
        aria-label="Date"
        minValue={new CalendarDate(2000, 1, 1)}
        maxValue={new CalendarDate(2000, 12, 31)}
      />,
    );
    const [day] = segmentsOf(container);
    if (!day) throw new Error("no day segment");
    type(day, digits);
    leave();
    expect(
      segmentsOf(container)
        .map((s) => s.textContent)
        .join(""),
    ).toBe(digits);
    expect(container.querySelector('[data-invalid="true"]')).not.toBeNull();
    expect(errorOf(container)).not.toBe("");
  });

  it("shows an error from outside in place of the description, as an alert, and marks the field invalid", () => {
    const container = mount(
      <DateField aria-label="Date" description="A hint." error="Date is in the past." />,
    );
    expect(errorOf(container)).toBe("Date is in the past.");
    expect(container.querySelector('[role="alert"]')?.textContent).toBe("Date is in the past.");
    expect(container.querySelector('[data-invalid="true"]')).not.toBeNull();
    expect(container.querySelector('[aria-invalid="true"]')).not.toBeNull();
    expect(container.textContent).not.toContain("A hint.");
  });

  it("marks a calendar DateField invalid from outside with isInvalid and errorMessage", () => {
    const container = mount(
      <DateField calendar aria-label="Date" isInvalid errorMessage="Pick another day." />,
    );
    expect(errorOf(container)).toBe("Pick another day.");
    expect(container.querySelector('[aria-invalid="true"]')).not.toBeNull();
  });

  it("shows a calendar DateField's error from outside too", () => {
    const container = mount(
      <DateField calendar aria-label="Date" description="Hint" error="Taken." />,
    );
    expect(errorOf(container)).toBe("Taken.");
    expect(container.querySelector('[role="alert"]')).not.toBeNull();
    expect(container.textContent).not.toContain("Hint");
  });

  it("uses errorMessage in place of the built-in message", () => {
    const container = mount(<DateField aria-label="Date" errorMessage="Not a real birthday" />);
    const [day] = segmentsOf(container);
    if (!day) throw new Error("no day segment");
    type(day, "31021990");
    expect(errorOf(container)).toBe("Not a real birthday");
  });

  it("posts the value as YYYY-MM-DD under name", () => {
    const container = mount(
      <DateField aria-label="Date" name="dob" defaultValue={new CalendarDate(1990, 5, 17)} />,
    );
    expect(container.querySelector<HTMLInputElement>('input[name="dob"]')?.value).toBe(
      "1990-05-17",
    );
  });
});

describe("DateField calendar", () => {
  it("reads typed digits as day, month, year under a US locale", () => {
    const onChange = vi.fn<(date: CalendarDate | null) => void>();
    const container = mount(<DateField calendar aria-label="Date" onChange={onChange} />);
    const [day] = segmentsOf(container);
    if (!day) throw new Error("no day segment");
    type(day, "17051990");
    expect(onChange.mock.calls.at(-1)?.[0]?.compare(new CalendarDate(1990, 5, 17))).toBe(0);
  });

  it("opens a Monday-first calendar with month and year dropdowns", () => {
    mount(
      <DateField
        calendar
        aria-label="Date"
        defaultOpen
        defaultValue={new CalendarDate(1990, 5, 17)}
      />,
    );
    const grid = document.querySelector('[role="grid"]');
    expect(grid).not.toBeNull();
    const weekdays = Array.from(grid?.querySelectorAll("th") ?? []).map((th) => th.textContent);
    expect(weekdays[0]).toBe("Mon");
    expect(document.querySelector<HTMLSelectElement>('select[aria-label="Month"]')?.value).toBe(
      "5",
    );
    expect(document.querySelector<HTMLSelectElement>('select[aria-label="Year"]')?.value).toBe(
      "1990",
    );
  });

  it("clears the value from the calendar footer", () => {
    const onChange = vi.fn<(date: CalendarDate | null) => void>();
    mount(
      <DateField
        calendar
        aria-label="Date"
        defaultOpen
        defaultValue={new CalendarDate(1990, 5, 17)}
        onChange={onChange}
      />,
    );
    const clear = Array.from(document.querySelectorAll("button")).find(
      (b) => b.textContent === "Clear",
    );
    if (!clear) throw new Error("no Clear button");
    act(() => clear.click());
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it("flags an impossible date", () => {
    const container = mount(<DateField calendar aria-label="Date" />);
    const [day] = segmentsOf(container);
    if (!day) throw new Error("no day segment");
    type(day, "31021990");
    expect(errorOf(container)).toBe("February 1990 has 28 days.");
  });

  it("keeps an impossible date as typed when focus leaves", () => {
    const onChange = vi.fn<(date: CalendarDate | null) => void>();
    const container = mount(
      <DateField calendar aria-label="Date" name="dob" onChange={onChange} />,
    );
    const [day] = segmentsOf(container);
    if (!day) throw new Error("no day segment");
    type(day, "31021990");
    leave();
    expect(segmentsOf(container).map((s) => s.textContent)).toEqual(["31", "02", "1990"]);
    expect(errorOf(container)).toBe("February 1990 has 28 days.");
    expect(onChange).not.toHaveBeenCalled();
    expect(container.querySelector<HTMLInputElement>('input[name="dob"]')?.value).toBe("");
  });

  it("keeps an impossible date as typed when focus moves to the calendar button", () => {
    const onChange = vi.fn<(date: CalendarDate | null) => void>();
    const container = mount(<DateField calendar aria-label="Date" onChange={onChange} />);
    const [day] = segmentsOf(container);
    if (!day) throw new Error("no day segment");
    type(day, "31021990");
    const button = container.querySelector<HTMLButtonElement>("button");
    if (!button) throw new Error("no calendar button");
    act(() => button.focus());
    expect(segmentsOf(container).map((s) => s.textContent)).toEqual(["31", "02", "1990"]);
    expect(onChange).not.toHaveBeenCalled();
  });
});
