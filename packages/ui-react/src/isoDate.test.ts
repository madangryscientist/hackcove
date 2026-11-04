import { CalendarDate } from "@internationalized/date";
import { describe, expect, it } from "vitest";
import { fromISODate, toISODate } from "./isoDate.js";

describe("toISODate", () => {
  it("writes YYYY-MM-DD with leading zeros", () => {
    expect(toISODate(new CalendarDate(1990, 5, 7))).toBe("1990-05-07");
  });

  it("writes an empty string for no date", () => {
    expect(toISODate(null)).toBe("");
    expect(toISODate(undefined)).toBe("");
  });
});

describe("fromISODate", () => {
  it("reads YYYY-MM-DD into a CalendarDate", () => {
    const date = fromISODate("1990-05-17");
    expect(date?.compare(new CalendarDate(1990, 5, 17))).toBe(0);
  });

  it("round-trips with toISODate", () => {
    expect(toISODate(fromISODate("2024-02-29"))).toBe("2024-02-29");
  });

  it("returns null for a day that does not exist, rather than rolling it over", () => {
    expect(fromISODate("1990-02-31")).toBeNull();
    expect(fromISODate("2023-02-29")).toBeNull();
    expect(fromISODate("1990-13-01")).toBeNull();
  });

  it("returns null for anything that is not YYYY-MM-DD", () => {
    expect(fromISODate("")).toBeNull();
    expect(fromISODate(null)).toBeNull();
    expect(fromISODate("17/05/1990")).toBeNull();
    expect(fromISODate("1990-5-17")).toBeNull();
    expect(fromISODate("1990-05-17T00:00")).toBeNull();
  });
});
