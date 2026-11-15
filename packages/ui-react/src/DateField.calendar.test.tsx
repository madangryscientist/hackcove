// @vitest-environment jsdom
import { CalendarDate } from "@internationalized/date";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DateField } from "./DateField.js";
import { render, screen, user, within } from "./render.harness.js";

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
const posted = () => new FormData(screen.getByRole("form")).get("dob");

/** Click into the day segment and type, as a person does: the field moves on segment by segment. */
async function typeDate(digits: string) {
  const u = user();
  await u.click(segments()[0] ?? document.body);
  await u.keyboard(digits);
  return u;
}

/** Click somewhere else on the page, which is how a person leaves the field. */
const leave = () => user().click(document.body);

describe("DateField", () => {
  it("shows DD, MM and YYYY placeholders in day-month-year order, under its label", () => {
    render(<DateField label="Date of birth" />);
    expect(screen.getByRole("group", { name: "Date of birth" })).not.toBeNull();
    expect(shown()).toEqual(["DD", "MM", "YYYY"]);
  });

  it("reads typed digits segment by segment as day, month, year", async () => {
    const onChange = vi.fn<(date: CalendarDate | null) => void>();
    render(<DateField aria-label="Date" onChange={onChange} />);
    await typeDate("17051990");
    expect(shown()).toEqual(["17", "05", "1990"]);
    expect(onChange.mock.lastCall?.[0]?.toString()).toBe("1990-05-17");
  });

  it("shows a filled value as DD/MM/YYYY", () => {
    render(<DateField aria-label="Date" defaultValue={new CalendarDate(1990, 5, 7)} />);
    expect(shown()).toEqual(["07", "05", "1990"]);
  });

  it("flags an impossible date with how many days the month has, tied to the field", async () => {
    render(<DateField aria-label="Date" />);
    await typeDate("31021990");
    expect(
      screen.getByRole("group", { name: "Date", description: "February 1990 has 28 days." }),
    ).not.toBeNull();
    expect(segments()[0]?.getAttribute("aria-invalid")).toBe("true");
  });

  it("keeps an impossible date as typed when focus leaves, and never reports a clamped one", async () => {
    const onChange = vi.fn<(date: CalendarDate | null) => void>();
    render(
      <form aria-label="Profile">
        <DateField aria-label="Date" name="dob" onChange={onChange} />
      </form>,
    );
    await typeDate("31021990");
    await leave();
    expect(shown()).toEqual(["31", "02", "1990"]);
    expect(screen.getByText("February 1990 has 28 days.")).not.toBeNull();
    expect(segments()[0]?.getAttribute("aria-invalid")).toBe("true");
    expect(onChange).not.toHaveBeenCalled();
    expect(posted()).toBe("");
  });

  it.each([
    ["before minValue", "01061999"],
    ["after maxValue", "01062001"],
  ])("flags a typed date %s", async (_, digits) => {
    render(
      <DateField
        aria-label="Date"
        minValue={new CalendarDate(2000, 1, 1)}
        maxValue={new CalendarDate(2000, 12, 31)}
      />,
    );
    await typeDate(digits);
    await leave();
    expect(shown().join("")).toBe(digits);
    expect(segments()[0]?.getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByRole("group", { name: "Date", description: /\S/ })).not.toBeNull();
  });

  it("shows an error from outside in place of the description, as an alert, and marks the field invalid", () => {
    render(<DateField aria-label="Date" description="A hint." error="Date is in the past." />);
    expect(screen.getByRole("alert").textContent).toBe("Date is in the past.");
    expect(
      screen.getByRole("group", { name: "Date", description: "Date is in the past." }),
    ).not.toBeNull();
    expect(segments()[0]?.getAttribute("aria-invalid")).toBe("true");
    expect(screen.queryByText("A hint.")).toBeNull();
  });

  it("marks a calendar DateField invalid from outside with isInvalid and errorMessage", () => {
    render(<DateField calendar aria-label="Date" isInvalid errorMessage="Pick another day." />);
    expect(screen.getByText("Pick another day.")).not.toBeNull();
    expect(segments()[0]?.getAttribute("aria-invalid")).toBe("true");
  });

  it("shows a calendar DateField's error from outside too", () => {
    render(<DateField calendar aria-label="Date" description="Hint" error="Taken." />);
    expect(screen.getByRole("alert").textContent).toBe("Taken.");
    expect(screen.queryByText("Hint")).toBeNull();
  });

  it("uses errorMessage in place of the built-in message", async () => {
    render(<DateField aria-label="Date" errorMessage="Not a real birthday" />);
    await typeDate("31021990");
    expect(screen.getByText("Not a real birthday")).not.toBeNull();
    expect(screen.queryByText("February 1990 has 28 days.")).toBeNull();
  });

  it("posts the value as YYYY-MM-DD under name", () => {
    render(
      <form aria-label="Profile">
        <DateField aria-label="Date" name="dob" defaultValue={new CalendarDate(1990, 5, 17)} />
      </form>,
    );
    expect(posted()).toBe("1990-05-17");
  });
});

describe("DateField calendar", () => {
  it("reads typed digits as day, month, year under a US locale", async () => {
    const onChange = vi.fn<(date: CalendarDate | null) => void>();
    render(<DateField calendar aria-label="Date" onChange={onChange} />);
    await typeDate("17051990");
    expect(onChange.mock.lastCall?.[0]?.toString()).toBe("1990-05-17");
  });

  it("opens a Monday-first calendar with month and year dropdowns", () => {
    render(
      <DateField
        calendar
        aria-label="Date"
        defaultOpen
        defaultValue={new CalendarDate(1990, 5, 17)}
      />,
    );
    // The weekday row is hidden from assistive tech; each day is named with its weekday.
    const days = within(screen.getByRole("grid", { name: "May 1990" })).getAllByRole("button");
    expect(days[0]?.getAttribute("aria-label")).toBe("Monday, 30 April 1990");
    expect(screen.getByRole<HTMLSelectElement>("combobox", { name: "Month" }).value).toBe("5");
    expect(screen.getByRole<HTMLSelectElement>("combobox", { name: "Year" }).value).toBe("1990");
  });

  it("clears the value from the calendar footer", async () => {
    const onChange = vi.fn<(date: CalendarDate | null) => void>();
    render(
      <DateField
        calendar
        aria-label="Date"
        defaultOpen
        defaultValue={new CalendarDate(1990, 5, 17)}
        onChange={onChange}
      />,
    );
    await user().click(screen.getByRole("button", { name: "Clear" }));
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it("flags an impossible date", async () => {
    render(<DateField calendar aria-label="Date" />);
    await typeDate("31021990");
    expect(screen.getByText("February 1990 has 28 days.")).not.toBeNull();
  });

  it("keeps an impossible date as typed when focus leaves", async () => {
    const onChange = vi.fn<(date: CalendarDate | null) => void>();
    render(
      <form aria-label="Profile">
        <DateField calendar aria-label="Date" name="dob" onChange={onChange} />
      </form>,
    );
    await typeDate("31021990");
    await leave();
    expect(shown()).toEqual(["31", "02", "1990"]);
    expect(screen.getByText("February 1990 has 28 days.")).not.toBeNull();
    expect(onChange).not.toHaveBeenCalled();
    expect(posted()).toBe("");
  });

  it("keeps an impossible date as typed when focus moves to the calendar button", async () => {
    const onChange = vi.fn<(date: CalendarDate | null) => void>();
    render(<DateField calendar aria-label="Date" onChange={onChange} />);
    const u = await typeDate("31021990");
    await u.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: /^Calendar/ }));
    expect(shown()).toEqual(["31", "02", "1990"]);
    expect(onChange).not.toHaveBeenCalled();
  });
});
