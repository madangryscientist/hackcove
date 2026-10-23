import { CalendarDate } from "@internationalized/date";

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** `"1990-05-17"` for `CalendarDate(1990, 5, 17)`; `""` for no date, so it drops into a form field. */
export function toISODate(date: CalendarDate | null | undefined): string {
  return date ? date.toString() : "";
}

/** The `CalendarDate` of a `"YYYY-MM-DD"` string; `null` for an empty, malformed or impossible one. */
export function fromISODate(iso: string | null | undefined): CalendarDate | null {
  const match = ISO_DATE.exec(iso ?? "");
  if (!match) return null;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new CalendarDate(year, month, day);
  // CalendarDate constrains 1990-02-31 to 1990-02-28; a string that does not survive is impossible.
  return date.toString() === iso ? date : null;
}
