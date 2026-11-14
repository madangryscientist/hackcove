// @vitest-environment jsdom
import { CalendarDate } from "@internationalized/date";
import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { errorOf, leave, segmentsOf, type } from "./date.harness.js";
import { type DateRange, DateRangePicker } from "./DateRangePicker.js";
import { mount, unmount } from "./dom.harness.js";

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

const october: DateRange = {
  start: new CalendarDate(2026, 10, 1),
  end: new CalendarDate(2026, 10, 31),
};

const texts = (container: HTMLElement) => segmentsOf(container).map((s) => s.textContent);
const groupNamed = (container: HTMLElement, name: string) =>
  Array.from(container.querySelectorAll<HTMLElement>('[role="group"]')).find((group) =>
    group.getAttribute("aria-label")?.includes(name),
  );
const iso = (range: DateRange | null | undefined) =>
  range ? `${range.start.toString()}/${range.end.toString()}` : range;

describe("DateRangePicker", () => {
  it("names the start and end groups and shows DD/MM/YYYY on each side", () => {
    const container = mount(<DateRangePicker label="Period" />);
    expect(groupNamed(container, "Start date")).toBeDefined();
    expect(groupNamed(container, "End date")).toBeDefined();
    expect(texts(container)).toEqual(["DD", "MM", "YYYY", "DD", "MM", "YYYY"]);
    expect(container.textContent).toContain("to");
  });

  it("reports the range once both sides are typed, and posts each side", () => {
    const onChange = vi.fn<(range: DateRange | null) => void>();
    const container = mount(
      <DateRangePicker label="Period" startName="from" endName="to" onChange={onChange} />,
    );
    const [startDay, , , endDay] = segmentsOf(container);
    if (!startDay || !endDay) throw new Error("no day segments");
    type(startDay, "01102026");
    expect(onChange).not.toHaveBeenCalled();
    type(endDay, "31102026");
    expect(iso(onChange.mock.calls.at(-1)?.[0])).toBe("2026-10-01/2026-10-31");
    expect(container.querySelector<HTMLInputElement>('input[name="from"]')?.value).toBe(
      "2026-10-01",
    );
    expect(container.querySelector<HTMLInputElement>('input[name="to"]')?.value).toBe("2026-10-31");
  });

  it("reports null and is invalid when the end is before the start", () => {
    const onChange = vi.fn<(range: DateRange | null) => void>();
    const container = mount(
      <DateRangePicker
        label="Period"
        startName="from"
        defaultValue={october}
        onChange={onChange}
      />,
    );
    const [, , , endDay] = segmentsOf(container);
    if (!endDay) throw new Error("no end day");
    type(endDay, "15092026");
    leave();
    expect(onChange).toHaveBeenLastCalledWith(null);
    expect(errorOf(container)).toBe("The end date is before the start date.");
    expect(container.querySelector('[data-invalid="true"]')).not.toBeNull();
    expect(container.querySelector<HTMLInputElement>('input[name="from"]')?.value).toBe("");
  });

  it("flags an impossible end day, keeps it as typed on blur and reports null", () => {
    const onChange = vi.fn<(range: DateRange | null) => void>();
    const container = mount(<DateRangePicker label="Period" endName="to" onChange={onChange} />);
    const [startDay, , , endDay] = segmentsOf(container);
    if (!startDay || !endDay) throw new Error("no day segments");
    type(startDay, "01022026");
    type(endDay, "31022026");
    expect(errorOf(container)).toBe("End date: February 2026 has 28 days.");
    leave();
    expect(texts(container)).toEqual(["01", "02", "2026", "31", "02", "2026"]);
    expect(errorOf(container)).toBe("End date: February 2026 has 28 days.");
    expect(container.querySelector('[data-invalid="true"]')).not.toBeNull();
    expect(onChange).not.toHaveBeenCalled();
    expect(container.querySelector<HTMLInputElement>('input[name="to"]')?.value).toBe("");
  });

  it("keeps an impossible start day when focus moves to the end side, which stays editable", () => {
    const onChange = vi.fn<(range: DateRange | null) => void>();
    const container = mount(<DateRangePicker label="Period" onChange={onChange} />);
    const [startDay, , , endDay] = segmentsOf(container);
    if (!startDay || !endDay) throw new Error("no day segments");
    type(startDay, "30022026");
    type(endDay, "10032026");
    expect(texts(container)).toEqual(["30", "02", "2026", "10", "03", "2026"]);
    expect(errorOf(container)).toBe("Start date: February 2026 has 28 days.");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("shows a given value on both sides", () => {
    const container = mount(<DateRangePicker label="Period" defaultValue={october} />);
    expect(texts(container)).toEqual(["01", "10", "2026", "31", "10", "2026"]);
  });

  it("opens one Monday-first month with the app's presets above it", () => {
    const onChange = vi.fn<(range: DateRange | null) => void>();
    const week: DateRange = {
      start: new CalendarDate(2026, 10, 25),
      end: new CalendarDate(2026, 10, 31),
    };
    mount(
      <DateRangePicker
        label="Period"
        defaultOpen
        defaultValue={october}
        presets={[{ label: "Last 7 days", value: week }]}
        onChange={onChange}
      />,
    );
    const grids = document.querySelectorAll('[role="grid"]');
    expect(grids).toHaveLength(1);
    expect(grids[0]?.querySelector("th")?.textContent).toBe("Mon");
    const preset = Array.from(document.querySelectorAll("button")).find(
      (b) => b.textContent === "Last 7 days",
    );
    if (!preset) throw new Error("no preset");
    act(() => preset.click());
    expect(iso(onChange.mock.calls.at(-1)?.[0])).toBe("2026-10-25/2026-10-31");
    expect(document.querySelector('[role="grid"]')).toBeNull();
  });

  it("clears the range from the calendar footer", () => {
    const onChange = vi.fn<(range: DateRange | null) => void>();
    mount(
      <DateRangePicker label="Period" defaultOpen defaultValue={october} onChange={onChange} />,
    );
    const clear = Array.from(document.querySelectorAll("button")).find(
      (b) => b.textContent === "Clear",
    );
    if (!clear) throw new Error("no Clear button");
    act(() => clear.click());
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it("shows an error from outside as an alert and marks the field invalid", () => {
    const container = mount(
      <DateRangePicker label="Period" description="A hint." error="Too long a period." />,
    );
    expect(errorOf(container)).toBe("Too long a period.");
    expect(container.querySelector('[role="alert"]')).not.toBeNull();
    expect(container.textContent).not.toContain("A hint.");
  });
});
