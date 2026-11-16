// @vitest-environment jsdom
import { CalendarDate } from "@internationalized/date";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { type DateRange, DateRangePicker } from "./DateRangePicker.js";
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

const october: DateRange = {
  start: new CalendarDate(2026, 10, 1),
  end: new CalendarDate(2026, 10, 31),
};

const shown = () => screen.getAllByRole("spinbutton").map((s) => s.textContent);
const side = (name: "Start date" | "End date") => screen.getByRole("group", { name });

/** Click into one side's day segment and type, as a person does. */
async function typeInto(name: "Start date" | "End date", digits: string) {
  const u = user();
  await u.click(within(side(name)).getAllByRole("spinbutton")[0] ?? document.body);
  await u.keyboard(digits);
}

describe("DateRangePicker", () => {
  it("names the start and end groups and shows DD/MM/YYYY on each side", () => {
    render(<DateRangePicker label="Period" />);
    expect(within(side("Start date")).getAllByRole("spinbutton")).toHaveLength(3);
    expect(within(side("End date")).getAllByRole("spinbutton")).toHaveLength(3);
    expect(shown()).toEqual(["DD", "MM", "YYYY", "DD", "MM", "YYYY"]);
    expect(screen.getByText("to")).not.toBeNull();
  });

  it("flags an impossible end day, keeps it as typed on blur and reports null", async () => {
    const onChange = vi.fn<(range: DateRange | null) => void>();
    render(
      <form aria-label="Report">
        <DateRangePicker label="Period" endName="to" onChange={onChange} />
      </form>,
    );
    await typeInto("Start date", "01022026");
    await typeInto("End date", "31022026");
    expect(screen.getByText("End date: February 2026 has 28 days.")).not.toBeNull();
    await user().click(document.body);
    expect(shown()).toEqual(["01", "02", "2026", "31", "02", "2026"]);
    expect(
      screen.getByRole("group", {
        name: "Period",
        description: "End date: February 2026 has 28 days.",
      }),
    ).not.toBeNull();
    expect(
      within(side("End date")).getAllByRole("spinbutton")[0]?.getAttribute("aria-invalid"),
    ).toBe("true");
    expect(onChange).not.toHaveBeenCalled();
    expect(new FormData(screen.getByRole<HTMLFormElement>("form")).get("to")).toBe("");
  });

  it("keeps an impossible start day when focus moves to the end side, which stays editable", async () => {
    const onChange = vi.fn<(range: DateRange | null) => void>();
    render(<DateRangePicker label="Period" onChange={onChange} />);
    await typeInto("Start date", "30022026");
    await typeInto("End date", "10032026");
    expect(shown()).toEqual(["30", "02", "2026", "10", "03", "2026"]);
    expect(screen.getByText("Start date: February 2026 has 28 days.")).not.toBeNull();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("opens one Monday-first month", () => {
    render(<DateRangePicker label="Period" defaultOpen defaultValue={october} />);
    expect(screen.getAllByRole("grid")).toHaveLength(1);
    const grid = screen.getByRole("grid");
    // The weekday row is hidden from assistive tech; each day is named with its weekday.
    expect(within(grid).getAllByRole("button")[0]?.getAttribute("aria-label")).toMatch(/^Monday,/);
  });

  it("clears the range from the calendar footer", async () => {
    const onChange = vi.fn<(range: DateRange | null) => void>();
    render(
      <DateRangePicker label="Period" defaultOpen defaultValue={october} onChange={onChange} />,
    );
    await user().click(screen.getByRole("button", { name: "Clear" }));
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it("shows an error from outside as an alert and marks the field invalid", () => {
    render(<DateRangePicker label="Period" hint="A hint." error="Too long a period." />);
    expect(screen.getByRole("alert").textContent).toBe("Too long a period.");
    expect(screen.getAllByRole("spinbutton")[0]?.getAttribute("aria-invalid")).toBe("true");
    expect(screen.queryByText("A hint.")).toBeNull();
  });
});
