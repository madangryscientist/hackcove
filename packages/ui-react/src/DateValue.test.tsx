// @vitest-environment jsdom
import { CalendarDate } from "@internationalized/date";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DateField } from "./DateField.js";
import { render, screen, user } from "./render.harness.js";

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
    <form aria-label="Profile">
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
    </form>
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
    <form aria-label="Profile">
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
    </form>
  );
}

beforeEach(() => {
  // A US browser: the field must still read DD/MM/YYYY.
  vi.spyOn(navigator, "language", "get").mockReturnValue("en-US");
  vi.spyOn(navigator, "languages", "get").mockReturnValue(["en-US"]);
  document.documentElement.lang = "en-US";
});
afterEach(() => {
  vi.restoreAllMocks();
  document.documentElement.lang = "";
});

const segments = () => screen.getAllByRole("spinbutton");
const shown = () => segments().map((s) => s.textContent);
const form = () => screen.getByRole<HTMLFormElement>("form");
const posted = () => new FormData(form()).get("dob");
const DAY = 0;
const YEAR = 2;

/** Click into one segment and type, as a person does: the field moves on segment by segment. */
async function typeInto(index: number, keys: string) {
  const u = user();
  await u.click(segments()[index] ?? document.body);
  await u.keyboard(keys);
}

/** Click somewhere else on the page, which is how a person leaves the field. */
const leave = () => user().click(document.body);

describe.each([
  ["DateField", DateField],
  ["DateField calendar", ((props) => <DateField {...props} calendar />) as typeof DateField],
])("%s reports what it shows", (_component, Field) => {
  const birthday = new CalendarDate(1990, 5, 17);

  it("reports null once when a valid date is edited into an impossible one", async () => {
    const onChange = vi.fn<(date: CalendarDate | null) => void>();
    render(<Controlled Field={Field} onChange={onChange} initial={birthday} />);
    await typeInto(DAY, "3102");
    await leave();
    // 03/05 and 31/05 on the way are real dates; the impossible one reports null, once.
    expect(onChange.mock.calls.map(([date]) => String(date))).toEqual([
      "1990-05-03",
      "1990-05-31",
      "null",
    ]);
    expect(posted()).toBe("");
    expect(shown()).toEqual(["31", "02", "1990"]);
    expect(screen.getByText("February 1990 has 28 days.")).not.toBeNull();
  });

  it("reports the date again once it is fixed", async () => {
    const onChange = vi.fn<(date: CalendarDate | null) => void>();
    render(<Controlled Field={Field} onChange={onChange} initial={birthday} />);
    await typeInto(DAY, "3102");
    await typeInto(DAY, "28");
    await leave();
    expect(onChange.mock.lastCall?.[0]?.toString()).toBe("1990-02-28");
    expect(posted()).toBe("1990-02-28");
    expect(screen.queryByText("February 1990 has 28 days.")).toBeNull();
    expect(segments()[DAY]?.getAttribute("aria-invalid")).toBeNull();
  });

  it("shows a value the parent sets, a reset to null included, and reports none of it", async () => {
    const onChange = vi.fn<(date: CalendarDate | null) => void>();
    render(<Parent Field={Field} onChange={onChange} />);
    await user().click(screen.getByRole("button", { name: "Set" }));
    expect(shown()).toEqual(["02", "01", "2001"]);
    expect(posted()).toBe("2001-01-02");
    await user().click(screen.getByRole("button", { name: "Reset" }));
    expect(shown()).toEqual(["DD", "MM", "YYYY"]);
    expect(posted()).toBe("");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("does not report null for an out-of-range value the parent loads after mount", async () => {
    const onChange = vi.fn<(date: CalendarDate | null) => void>();
    function Loader() {
      const [value, setValue] = useState<CalendarDate | null>(null);
      return (
        <form aria-label="Profile">
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
        </form>
      );
    }
    render(<Loader />);
    await user().click(screen.getByRole("button", { name: "Load" }));
    expect(shown()).toEqual(["02", "01", "2050"]);
    expect(posted()).toBe("");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("blocks a form submit when a required date is only partly filled", async () => {
    render(
      <form aria-label="Profile">
        <Field aria-label="Date" name="dob" required defaultValue={birthday} />
      </form>,
    );
    expect(form().checkValidity()).toBe(true);
    await typeInto(YEAR, "{Backspace}{Backspace}{Backspace}{Backspace}");
    expect(screen.queryByText("Enter the whole date.")).toBeNull();
    await leave();
    expect(shown()).toEqual(["17", "05", "YYYY"]);
    expect(posted()).toBe("");
    expect(form().checkValidity()).toBe(false);
    expect(screen.getByText("Enter the whole date.")).not.toBeNull();
  });

  it.each([
    ["before minValue", "1999"],
    ["after maxValue", "2001"],
  ])("reports null once when a valid date is edited %s", async (_case, year) => {
    const onChange = vi.fn<(date: CalendarDate | null) => void>();
    render(
      <Controlled
        Field={Field}
        onChange={onChange}
        initial={new CalendarDate(2000, 5, 17)}
        minValue={new CalendarDate(2000, 1, 1)}
        maxValue={new CalendarDate(2000, 12, 31)}
      />,
    );
    await typeInto(YEAR, year);
    await leave();
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith(null);
    expect(posted()).toBe("");
    expect(shown()).toEqual(["17", "05", year]);
    expect(segments()[YEAR]?.getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByRole("group", { name: "Date", description: /\S/ })).not.toBeNull();
  });
});
