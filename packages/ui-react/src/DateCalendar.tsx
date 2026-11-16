import { type CalendarDate, getLocalTimeZone, today } from "@internationalized/date";
import { type ReactElement, type ReactNode, useContext } from "react";
import {
  Button,
  Calendar,
  CalendarCell,
  type CalendarCellProps,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  CalendarStateContext,
  DatePickerStateContext,
  DateRangePickerStateContext,
  Dialog,
  Popover,
  RangeCalendar,
  RangeCalendarStateContext,
} from "react-aria-components";
import { cx, focusRing } from "./cx.js";
import { Button as PresetButton } from "./Button.js";
import { MONTH_OPTIONS, iconButtonClass } from "./DateField.js";
import type { DateRangePreset } from "./DateRangePicker.js";
import { Icon } from "./Icon.js";

export const calendarIcon = (
  <Icon>
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    >
      <rect x="3" y="4.5" width="14" height="12.5" rx="2" />
      <path d="M3 8.5h14M7 2.5v4M13 2.5v4" />
    </svg>
  </Icon>
);

const chevron = (d: string) => (
  <Icon>
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  </Icon>
);

const selectClass = `rounded-md border border-slate-300 bg-white py-1 pr-1 pl-2 text-sm text-slate-900 pointer-coarse:text-base transition hover:border-violet-400 ${focusRing}`;

/**
 * ‹, a month dropdown, a year dropdown and ›: a birth date decades back is two picks away. It reads
 * a one-date calendar's state, or a range calendar's when there is none.
 */
/** The names of the calendar's month and year dropdowns, for an app in another language. */
export type CalendarLabels = { monthLabel: string; yearLabel: string };

function CalendarHeader({ monthLabel, yearLabel }: CalendarLabels): ReactElement | null {
  const single = useContext(CalendarStateContext);
  const range = useContext(RangeCalendarStateContext);
  const state = single ?? range;
  if (!state) return null;
  const focused = state.focusedDate;
  const now = today(getLocalTimeZone()).year;
  const first = Math.min(state.minValue?.year ?? now - 100, focused.year);
  const last = Math.max(state.maxValue?.year ?? now + 10, focused.year);
  const years = Array.from({ length: last - first + 1 }, (_, i) => first + i);
  return (
    <div className="flex items-center gap-1.5">
      <Button slot="previous" className={iconButtonClass}>
        {chevron("M12.5 15l-5-5 5-5")}
      </Button>
      <select
        aria-label={monthLabel}
        className={cx(selectClass, "flex-1")}
        value={focused.month}
        disabled={state.isDisabled}
        onChange={(event) =>
          state.setFocusedDate(focused.set({ month: Number(event.target.value) }))
        }
      >
        {MONTH_OPTIONS.map(({ month, name }) => (
          <option key={month} value={month}>
            {name}
          </option>
        ))}
      </select>
      <select
        aria-label={yearLabel}
        className={selectClass}
        value={focused.year}
        disabled={state.isDisabled}
        onChange={(event) =>
          state.setFocusedDate(focused.set({ year: Number(event.target.value) }))
        }
      >
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
      <Button slot="next" className={iconButtonClass}>
        {chevron("M7.5 5l5 5-5 5")}
      </Button>
    </div>
  );
}

/** Clears the picker's value, a date or a range, and closes the popover. */
function ClearButton(): ReactElement {
  const single = useContext(DatePickerStateContext);
  const range = useContext(DateRangePickerStateContext);
  const picker = single ?? range;
  return (
    <button
      type="button"
      className={`rounded-md px-2 py-1 text-sm font-medium text-violet-600 transition hover:bg-violet-50 ${focusRing}`}
      onClick={() => {
        picker?.setValue(null);
        picker?.close();
      }}
    >
      Clear
    </button>
  );
}

const cellClass = ({
  isSelected,
  isOutsideMonth,
  isDisabled,
  isUnavailable,
  isInvalid,
}: {
  isSelected: boolean;
  isOutsideMonth: boolean;
  isDisabled: boolean;
  isUnavailable: boolean;
  isInvalid: boolean;
}): string => {
  let tone = "cursor-pointer text-slate-700 hover:bg-slate-100";
  if (isSelected) tone = isInvalid ? "bg-red-50 text-red-700" : "bg-violet-600 text-violet-50";
  else if (isOutsideMonth || isDisabled || isUnavailable) tone = "text-slate-300";
  return cx(
    "flex h-9 w-9 items-center justify-center rounded-lg text-sm tabular-nums",
    tone,
    focusRing,
  );
};

type RangeCell = {
  isSelected: boolean;
  isSelectionStart: boolean;
  isSelectionEnd: boolean;
  isOutsideMonth: boolean;
  isDisabled: boolean;
  isUnavailable: boolean;
  isInvalid: boolean;
};

/** The colour of a day in a range calendar: the ends filled, the days between a light band. */
function rangeTone(cell: RangeCell): string {
  if (cell.isOutsideMonth || cell.isDisabled || cell.isUnavailable) return "text-slate-300";
  if (!cell.isSelected) return "cursor-pointer text-slate-700 hover:bg-slate-100";
  if (cell.isInvalid) return "bg-red-50 text-red-700";
  if (cell.isSelectionStart || cell.isSelectionEnd) return "bg-violet-600 text-violet-50";
  return "bg-violet-50 text-violet-700";
}

/**
 * A day in a range calendar. The selected days join into one band: square between the ends, rounded
 * on the outer side of each end. Any other day is rounded like a `cellClass` day.
 */
const rangeCellClass = (cell: RangeCell): string =>
  cx(
    "flex h-9 w-9 items-center justify-center text-sm tabular-nums",
    rangeTone(cell),
    cell.isSelected && !cell.isOutsideMonth
      ? cx(cell.isSelectionStart && "rounded-l-lg", cell.isSelectionEnd && "rounded-r-lg")
      : "rounded-lg",
    focusRing,
  );

/** The weekday row and the days of the month on show, in a `Calendar` or a `RangeCalendar`. */
function MonthGrid({
  cellClass: dayClass,
}: {
  cellClass: NonNullable<CalendarCellProps["className"]>;
}): ReactElement {
  return (
    <CalendarGrid weekdayStyle="short">
      <CalendarGridHeader>
        {(day) => (
          <CalendarHeaderCell className="pb-1 text-xs font-medium text-slate-500">
            {day}
          </CalendarHeaderCell>
        )}
      </CalendarGridHeader>
      <CalendarGridBody>
        {(date) => <CalendarCell date={date} className={dayClass} />}
      </CalendarGridBody>
    </CalendarGrid>
  );
}

/**
 * The popover's frame and dialog. `container` is the modal `<dialog>` the picker sits in, if any: a
 * modal makes everything outside it inert and paints above the body, so the popover renders inside
 * it (which also keeps the theme's scope class).
 */
function PickerPopover({
  container,
  children,
}: {
  container: Element | undefined;
  children: ReactNode;
}): ReactElement {
  return (
    <Popover
      {...(container ? { UNSTABLE_portalContainer: container } : {})}
      placement="bottom start"
      className="rounded-xl border border-slate-200 bg-white p-3 text-slate-900 shadow-lg"
    >
      <Dialog className="flex flex-col gap-3 outline-none">
        {children}
        <div className="flex justify-end border-t border-slate-200 pt-2">
          <ClearButton />
        </div>
      </Dialog>
    </Popover>
  );
}

/** The date picker's popover: header, a Monday-first month grid and a Clear footer. */
export function CalendarPopover({
  container,
  labels,
}: {
  container: Element | undefined;
  labels: CalendarLabels;
}): ReactElement {
  return (
    <PickerPopover container={container}>
      <Calendar<CalendarDate> firstDayOfWeek="mon" className="flex flex-col gap-3">
        <CalendarHeader {...labels} />
        <MonthGrid cellClass={cellClass} />
      </Calendar>
    </PickerPopover>
  );
}

/** A preset's button: sets the range, which reports it, and closes the popover. */
function PresetRow({ presets }: { presets: readonly DateRangePreset[] }): ReactElement {
  const picker = useContext(DateRangePickerStateContext);
  return (
    // `w-0 min-w-full`: as wide as the month grid, never wider, so the row wraps instead.
    <div className="flex w-0 min-w-full flex-wrap gap-1.5">
      {presets.map((preset) => (
        <PresetButton
          key={preset.label}
          variant="outline"
          size="sm"
          onClick={() => {
            picker?.setValue(preset.value);
            picker?.close();
          }}
        >
          {preset.label}
        </PresetButton>
      ))}
    </div>
  );
}

/** The range picker's popover: the presets, if any, the header, one Monday-first month and Clear. */
export function RangeCalendarPopover({
  container,
  presets,
  labels,
}: {
  container: Element | undefined;
  presets: readonly DateRangePreset[] | undefined;
  labels: CalendarLabels;
}): ReactElement {
  return (
    <PickerPopover container={container}>
      {presets && presets.length > 0 ? <PresetRow presets={presets} /> : null}
      <RangeCalendar<CalendarDate> firstDayOfWeek="mon" className="flex flex-col gap-3">
        <CalendarHeader {...labels} />
        <MonthGrid cellClass={rangeCellClass} />
      </RangeCalendar>
    </PickerPopover>
  );
}
