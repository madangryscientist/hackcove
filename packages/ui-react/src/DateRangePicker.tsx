import type { CalendarDate } from "@internationalized/date";
import { type ReactElement, type ReactNode, useContext } from "react";
import {
  Button,
  DateFieldContext,
  DateInput,
  DateRangePicker as AriaDateRangePicker,
  Group,
  I18nProvider,
  Label,
} from "react-aria-components";
import { cx } from "./cx.js";
import { RangeCalendarPopover, calendarIcon } from "./DateCalendar.js";
import {
  FieldSegment,
  type FieldProps,
  LOCALE,
  type Read,
  forcedInvalid,
  frameClass,
  iconButtonLook,
  labelClass,
  Notes,
} from "./DateField.js";
import { PICKER_SIZE, useDialogContainer } from "./DateFieldCalendar.js";
import type { DataAttributes } from "./link.js";
import { ShownInput, type ShownRange, useShownRange } from "./shownDate.js";

/** A from and to date: `start` on or before `end`. */
export type DateRange = ShownRange;

/** A ready-made range the app builds from its own today, such as "Last 7 days". */
export type DateRangePreset = { label: string; value: DateRange };

export type DateRangePickerProps = Pick<
  FieldProps,
  | "label"
  | "description"
  | "errorMessage"
  | "error"
  | "isInvalid"
  | "size"
  | "minValue"
  | "maxValue"
  | "isRequired"
  | "isDisabled"
  | "aria-label"
  | "aria-labelledby"
  | "aria-describedby"
  | "aria-details"
> &
  DataAttributes & {
    /** The range, or `null` for none. Reported only when both days are complete, real and in order. */
    value?: DateRange | null | undefined;
    /** The range shown first when the picker holds its own value. */
    defaultValue?: DateRange | null | undefined;
    /** Called with the range once both sides make one, and with `null` when they stop making one. */
    onChange?: ((range: DateRange | null) => void) | undefined;
    /** Posts the start as `YYYY-MM-DD` in a form, or `""` while there is no range. */
    startName?: string | undefined;
    /** Posts the end as `YYYY-MM-DD` in a form, or `""` while there is no range. */
    endName?: string | undefined;
    /**
     * Ready-made ranges, a row of buttons above the month. The app builds them from its own today;
     * the picker has none of its own and never reads the clock.
     */
    presets?: readonly DateRangePreset[] | undefined;
    /** Open the calendar on mount. */
    defaultOpen?: boolean | undefined;
  };

type Side = ReturnType<typeof useShownRange>["start"];

/**
 * One side's segments, named for a screen reader and read-only while focus leaves it with an
 * impossible day (see `useShownDate`). React Aria hands each side its field props through the
 * `start` and `end` slots; only this side's slot is changed.
 */
function SideInput({
  slot,
  name,
  side,
  onRead,
}: {
  slot: "start" | "end";
  name: string;
  side: Side;
  onRead: (read: Read) => void;
}): ReactNode {
  const field = useContext(DateFieldContext);
  const slots = field && "slots" in field ? field.slots : undefined;
  const own = slots?.[slot] ?? {};
  return (
    <div
      role="group"
      aria-label={name}
      className="flex items-center"
      onBlurCapture={side.onBlurCapture}
    >
      <DateFieldContext.Provider
        value={{
          slots: {
            ...slots,
            [slot]: { ...own, isReadOnly: side.leaving, onBlur: side.onLeft },
          },
        }}
      >
        <DateInput slot={slot} className="flex">
          {(segment) => (
            <FieldSegment segment={segment} {...(segment.type === "day" ? { onRead } : {})} />
          )}
        </DateInput>
      </DateFieldContext.Provider>
    </div>
  );
}

/**
 * A from and to date in one field: DD/MM/YYYY "to" DD/MM/YYYY and a calendar button that opens one
 * Monday-first month, where two presses pick the range. `presets` adds the app's ready-made ranges
 * above the month. The range is reported only when both sides are complete, real dates within
 * min/max and the start is on or before the end; otherwise `null`.
 */
export function DateRangePicker({
  label,
  description,
  errorMessage,
  error,
  isInvalid: invalidProp,
  value,
  defaultValue,
  onChange,
  startName,
  endName,
  presets,
  defaultOpen,
  size = "md",
  ...rest
}: DateRangePickerProps): ReactElement {
  const shown = useShownRange({
    value,
    defaultValue,
    onChange,
    minValue: rest.minValue,
    maxValue: rest.maxValue,
    isRequired: rest.isRequired,
  });
  const { container, findDialog } = useDialogContainer();
  return (
    <I18nProvider locale={LOCALE}>
      <AriaDateRangePicker<CalendarDate>
        {...rest}
        {...(defaultOpen === undefined ? {} : { defaultOpen })}
        ref={findDialog}
        value={shown.inner}
        onChange={shown.setInner}
        validate={shown.validate}
        {...forcedInvalid({ impossible: shown.problem, isInvalid: invalidProp, error })}
        granularity="day"
        shouldForceLeadingZeros
        className="flex flex-col gap-1.5"
      >
        {({ isInvalid }) => (
          <>
            {label ? <Label className={labelClass}>{label}</Label> : null}
            <Group className={(state) => cx(frameClass(state), "gap-1", PICKER_SIZE[size].frame)}>
              <SideInput
                slot="start"
                name="Start date"
                side={shown.start}
                onRead={shown.onReadStart}
              />
              <span aria-hidden="true" className="px-1 text-slate-500">
                to
              </span>
              <SideInput slot="end" name="End date" side={shown.end} onRead={shown.onReadEnd} />
              <Button className={cx(iconButtonLook, PICKER_SIZE[size].button, "ml-auto")}>
                {calendarIcon}
              </Button>
            </Group>
            <ShownInput name={startName} shown={shown.startShown} isDisabled={rest.isDisabled} />
            <ShownInput name={endName} shown={shown.endShown} isDisabled={rest.isDisabled} />
            <Notes
              description={description}
              errorMessage={errorMessage}
              error={error}
              impossible={shown.problem}
              isInvalid={isInvalid}
            />
            <RangeCalendarPopover container={container} presets={presets} />
          </>
        )}
      </AriaDateRangePicker>
    </I18nProvider>
  );
}
