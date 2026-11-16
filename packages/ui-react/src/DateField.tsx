import {
  type CalendarDate,
  CalendarDate as CalendarDateClass,
  DateFormatter,
} from "@internationalized/date";
import { type ContextType, type ReactElement, type ReactNode, useContext, useEffect } from "react";
import {
  DateField as AriaDateField,
  type DateFieldProps as AriaDateFieldProps,
  DateFieldStateContext,
  DateInput,
  DateSegment,
  FieldError,
  I18nProvider,
  Label,
  Text,
} from "react-aria-components";
import { cx, focusRing } from "./cx.js";
import { CalendarDateField } from "./DateFieldCalendar.js";
import { toISODate } from "./isoDate.js";
import { definedProps, type Passthrough } from "./props.js";
import { WaitingField } from "./fieldWait.js";
import { type LoadingProps, useLoading } from "./skeleton.js";
import { ShownInput, useShownDate } from "./shownDate.js";
import type { Size } from "./size.js";
import { controlText, useTypeStep } from "./density.js";

/** Fixed, whatever the browser's locale: DD/MM/YYYY and Monday-first weeks. */
export const LOCALE = "en-GB";
const MONTHS = new DateFormatter(LOCALE, { month: "long", timeZone: "UTC" });
export const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  month: i + 1,
  name: MONTHS.format(new Date(Date.UTC(2000, i, 1))),
}));

type Segment = NonNullable<ContextType<typeof DateFieldStateContext>>["segments"][number];

/** The props of a plain `DateField`, without the calendar. */
export type FieldProps = {
  /** The field's visible label, above it. Without one, name the field with `aria-label`. */
  label?: ReactNode;
  /** A muted line under the field that says more; an error replaces it. */
  hint?: ReactNode;
  /**
   * Marks the field invalid and shows this in red with `role="alert"`, in place of the hint and of
   * the built-in message (an impossible date, or one outside min/max). Like `Field`'s `error`.
   */
  error?: ReactNode;
  /**
   * The field's height and text, on the same scale as an `Input`: `sm` is `text-sm`, `md` `text-base`,
   * `lg` `text-lg`, one step down under an `AppShell density="compact"`, and never under 16px on touch.
   * @default md
   */
  size?: Size;
  /** Disables the field: no typing, no calendar. */
  disabled?: boolean | undefined;
  /** Marks a date required: the field is `aria-required`, and an empty one is invalid. */
  required?: boolean | undefined;
  /** The date shown, controlled, with `onChange`; `null` is an empty field. */
  value?: AriaDateFieldProps<CalendarDate>["value"];
  /** The date it starts with, uncontrolled. */
  defaultValue?: AriaDateFieldProps<CalendarDate>["defaultValue"];
  /** Called with the new date, or `null` when the field is cleared or the date is incomplete. */
  onChange?: AriaDateFieldProps<CalendarDate>["onChange"];
  /** The earliest date allowed: an earlier one marks the field invalid with its own message. */
  minValue?: AriaDateFieldProps<CalendarDate>["minValue"];
  /** The latest date allowed: a later one marks the field invalid with its own message. */
  maxValue?: AriaDateFieldProps<CalendarDate>["maxValue"];
  /** Posts the date in a form as `YYYY-MM-DD` under this key, or an empty string. */
  name?: AriaDateFieldProps<CalendarDate>["name"];
} & Passthrough;

/** The calendar's dropdown names, with their English defaults. */
type CalendarNames = {
  /**
   * The month dropdown's name, for an app in another language.
   * @default Month
   */
  monthLabel?: string | undefined;
  /**
   * The year dropdown's name, for an app in another language.
   * @default Year
   */
  yearLabel?: string | undefined;
};

export type DateFieldProps = FieldProps &
  LoadingProps &
  (
    | {
        /** Adds a calendar button that opens a month view in a popover; the field is a date picker. */
        calendar?: false | undefined;
        /** Only a `calendar` field takes `defaultOpen`. */
        defaultOpen?: undefined;
        /** Only a `calendar` field takes `monthLabel`. */
        monthLabel?: undefined;
        /** Only a `calendar` field takes `yearLabel`. */
        yearLabel?: undefined;
      }
    | ({
        calendar: true;
        /** Open the calendar on mount. */
        defaultOpen?: boolean | undefined;
      } & CalendarNames)
  );

/** The react-aria flags for `disabled` and `required`, set only when true. */
export function fieldFlags(
  disabled: boolean | undefined,
  required: boolean | undefined,
): { isDisabled?: true; isRequired?: true } {
  return { ...(disabled ? { isDisabled: true } : {}), ...(required ? { isRequired: true } : {}) };
}

/** What the segments show, as the day segment reports it to the field. */
export type Read = {
  /** The date as `YYYY-MM-DD` once every segment is filled and the day exists, else `""`. */
  typed: string;
  /** "February 1990 has 28 days." when the day does not exist. */
  impossible: string | null;
  /** Some segments are filled and some are not. */
  partial: boolean;
};

function readSegments(segments: Segment[]): Read {
  const editable = segments.filter((segment) => segment.isEditable);
  const blank = editable.filter((segment) => segment.isPlaceholder).length;
  const none = { typed: "", impossible: null, partial: blank > 0 && blank < editable.length };
  if (editable.length === 0 || blank > 0) return none;
  const part = (type: Segment["type"]) => editable.find((s) => s.type === type)?.value ?? 0;
  const [day, month, year] = [part("day"), part("month"), part("year")];
  if (day < 1 || month < 1 || year < 1) return none;
  const first = new CalendarDateClass(year, month, 1);
  const days = first.calendar.getDaysInMonth(first);
  if (day <= days) return { ...none, typed: toISODate(first.set({ day })) };
  return {
    ...none,
    impossible: `${MONTH_OPTIONS[month - 1]?.name ?? ""} ${year} has ${days} days.`,
  };
}

/** One segment. The day segment also reports what the segments show to the field. */
export function FieldSegment({
  segment,
  onRead,
}: {
  segment: Segment;
  onRead?: (read: Read) => void;
}): ReactElement {
  const state = useContext(DateFieldStateContext);
  const { typed, impossible, partial } = readSegments(state?.segments ?? []);
  useEffect(() => onRead?.({ typed, impossible, partial }), [typed, impossible, partial, onRead]);
  return (
    <DateSegment
      segment={segment}
      className={({ isFocused, isPlaceholder, type }) => {
        if (type === "literal") return "text-slate-400";
        let tone = "text-slate-900";
        if (isFocused) tone = "bg-violet-50 text-violet-600";
        else if (isPlaceholder) tone = "text-slate-400";
        return cx("rounded px-0.5 tabular-nums outline-none", tone);
      }}
    >
      {({ isPlaceholder, placeholder, text }) => (isPlaceholder ? placeholder.toUpperCase() : text)}
    </DateSegment>
  );
}

export function frameClass({
  isInvalid,
  isFocusWithin,
  isDisabled,
}: {
  isInvalid: boolean;
  isFocusWithin: boolean;
  isDisabled: boolean;
}): string {
  let tone = "border-slate-300 bg-white text-slate-900 hover:border-violet-400";
  if (isInvalid) tone = "border-red-200 bg-white text-slate-900";
  else if (isFocusWithin) tone = "border-violet-600 bg-white text-slate-900";
  return cx(
    "flex w-full items-center rounded-lg border transition",
    tone,
    isDisabled && "opacity-50",
  );
}

/** The props that force a field invalid: an impossible date, or an `error` from outside. Spread onto the React Aria field after the rest. */
export function forcedInvalid({
  impossible,
  error,
}: {
  impossible: string | null;
  error: ReactNode;
}): { isInvalid?: true } {
  return impossible || error ? { isInvalid: true } : {};
}

/** The hint or the error line: the shared outside of every date field. */
export function Notes({
  hint,
  error,
  impossible,
  isInvalid,
}: {
  hint: ReactNode;
  error: ReactNode;
  impossible: string | null;
  isInvalid: boolean;
}): ReactElement {
  return (
    <>
      {!isInvalid && hint ? (
        <Text slot="description" className="text-xs text-slate-500">
          {hint}
        </Text>
      ) : null}
      <FieldError className="text-xs text-red-700">
        {({ validationErrors }) =>
          error ? <span role="alert">{error}</span> : (impossible ?? validationErrors.join(" "))
        }
      </FieldError>
    </>
  );
}

/** A `DateField`'s padding, by `size`: the heights of an `Input`. Its type is `controlText`'s, as an `Input`'s. */
const FIELD_SIZE: Record<Size, string> = {
  sm: "py-1 pl-2 pr-2",
  md: "py-2 pl-2.5 pr-2.5",
  lg: "py-2.5 pl-3 pr-3",
};

export const labelClass = "text-sm font-medium text-slate-700";
/** A small icon button inside a date field or calendar, without its box size. */
export const iconButtonLook = `inline-flex shrink-0 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 disabled:opacity-50 ${focusRing}`;
export const iconButtonClass = `${iconButtonLook} h-7 w-7`;

/**
 * A segmented DD / MM / YYYY date input. Values are `CalendarDate`s; `name` posts it as
 * `YYYY-MM-DD`. `calendar` adds a calendar button that opens a month view in a popover, at the
 * same height as the plain field; `defaultOpen` opens it on mount. While `loading` the label is
 * drawn and the field is a bone of its height.
 */
export function DateField({
  calendar,
  defaultOpen,
  monthLabel = "Month",
  yearLabel = "Year",
  loading,
  loadingLabel,
  ...field
}: DateFieldProps): ReactElement {
  if (useLoading(loading).loading) {
    return (
      <WaitingField
        own={loading}
        loadingLabel={loadingLabel}
        label={field.label}
        look={labelClass}
        size={field.size}
        attrs={field}
      />
    );
  }
  if (calendar) {
    return (
      <CalendarDateField
        {...field}
        labels={{ monthLabel, yearLabel }}
        {...(defaultOpen === undefined ? {} : { defaultOpen })}
      />
    );
  }
  return <PlainDateField {...field} />;
}

function PlainDateField({
  label,
  hint,
  error,
  disabled,
  required,
  value,
  defaultValue,
  onChange,
  name,
  size = "md",
  ...rest
}: FieldProps): ReactElement {
  const step = useTypeStep();
  const { inner, setInner, shown, impossible, onRead, validate, leaving, onBlurCapture, onLeft } =
    useShownDate({
      value,
      defaultValue,
      onChange,
      minValue: rest.minValue,
      maxValue: rest.maxValue,
      isRequired: required,
    });
  return (
    <I18nProvider locale={LOCALE}>
      <AriaDateField<CalendarDate>
        {...definedProps(rest)}
        {...fieldFlags(disabled, required)}
        value={inner}
        onChange={setInner}
        validate={validate}
        {...forcedInvalid({ impossible, error })}
        isReadOnly={leaving}
        onBlur={onLeft}
        granularity="day"
        shouldForceLeadingZeros
        className="flex flex-col gap-1.5"
      >
        {({ isInvalid }) => (
          <>
            {label ? <Label className={labelClass}>{label}</Label> : null}
            <div className="contents" onBlurCapture={onBlurCapture}>
              <DateInput
                className={(state) =>
                  cx(frameClass(state), FIELD_SIZE[size], controlText(size, step, true))
                }
              >
                {(segment) => (
                  <FieldSegment segment={segment} {...(segment.type === "day" ? { onRead } : {})} />
                )}
              </DateInput>
            </div>
            <ShownInput name={name} shown={shown} isDisabled={disabled} />
            <Notes hint={hint} error={error} impossible={impossible} isInvalid={isInvalid} />
          </>
        )}
      </AriaDateField>
    </I18nProvider>
  );
}
