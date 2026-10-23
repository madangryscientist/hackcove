import { type CalendarDate, getLocalTimeZone, today } from "@internationalized/date";
import { type ReactElement, useContext } from "react";
import {
  Button,
  Calendar,
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  CalendarStateContext,
  DatePickerStateContext,
  Dialog,
  Popover,
} from "react-aria-components";
import { cx, focusRing } from "./cx.js";
import { MONTH_OPTIONS, iconButtonClass } from "./DateField.js";

export const calendarIcon = (
  <svg
    viewBox="0 0 20 20"
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <rect x="3" y="4.5" width="14" height="12.5" rx="2" />
    <path d="M3 8.5h14M7 2.5v4M13 2.5v4" />
  </svg>
);

const chevron = (d: string) => (
  <svg
    viewBox="0 0 20 20"
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d={d} />
  </svg>
);

const selectClass = `rounded-md border border-slate-300 bg-white py-1 pr-1 pl-2 text-sm text-slate-900 transition hover:border-violet-400 ${focusRing}`;

/** ‹, a month dropdown, a year dropdown and ›: a birth date decades back is two picks away. */
function CalendarHeader(): ReactElement | null {
  const state = useContext(CalendarStateContext);
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
        aria-label="Month"
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
        aria-label="Year"
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

function ClearButton(): ReactElement {
  const picker = useContext(DatePickerStateContext);
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

/** The picker's popover: header, a Monday-first month grid and a Clear footer. */
export function CalendarPopover(): ReactElement {
  return (
    <Popover
      placement="bottom start"
      className="rounded-xl border border-slate-200 bg-white p-3 text-slate-900 shadow-lg"
    >
      <Dialog className="flex flex-col gap-3 outline-none">
        <Calendar<CalendarDate> firstDayOfWeek="mon" className="flex flex-col gap-3">
          <CalendarHeader />
          <CalendarGrid weekdayStyle="short">
            <CalendarGridHeader>
              {(day) => (
                <CalendarHeaderCell className="pb-1 text-xs font-medium text-slate-500">
                  {day}
                </CalendarHeaderCell>
              )}
            </CalendarGridHeader>
            <CalendarGridBody>
              {(date) => <CalendarCell date={date} className={cellClass} />}
            </CalendarGridBody>
          </CalendarGrid>
        </Calendar>
        <div className="flex justify-end border-t border-slate-200 pt-2">
          <ClearButton />
        </div>
      </Dialog>
    </Popover>
  );
}
