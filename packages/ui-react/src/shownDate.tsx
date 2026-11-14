import type { CalendarDate } from "@internationalized/date";
import {
  type FocusEvent,
  type ReactElement,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { flushSync } from "react-dom";
import type { FieldProps, Read } from "./DateField.js";
import { fromISODate, toISODate } from "./isoDate.js";

type ValueKeys = "value" | "defaultValue" | "onChange" | "minValue" | "maxValue" | "isRequired";
/** The value props, each of which may be passed as `undefined`. */
type ValueProps = { [K in ValueKeys]?: FieldProps[K] | undefined };

/** `iso` when it is a date within min/max, else `""`. */
function withinRange(
  iso: string,
  { minValue, maxValue }: Pick<ValueProps, "minValue" | "maxValue">,
): string {
  const date = fromISODate(iso);
  if (!date) return "";
  if (minValue && date.compare(minValue) < 0) return "";
  if (maxValue && date.compare(maxValue) > 0) return "";
  return iso;
}

/**
 * The value the field reports is always what it shows: the typed date when it is complete, exists
 * and is within min/max, else `null`. Two parts of React Aria disagree with that, so this owns both:
 *
 * - **The value.** React Aria keeps its last valid date behind an impossible or partly cleared
 *   display, and reports an out-of-range one. So the consumer's `onChange` is fired from what the
 *   segments read, once per change: a valid date turning invalid reports `null`. React Aria itself
 *   is controlled by `inner`, so a parent holding that `null` does not wipe the typed segments; a
 *   `value` the parent sets that differs from the last report is passed through, and not reported
 *   back. Because React Aria's own value goes stale, `validate` checks `isRequired` against the
 *   segments: a partly filled required field blocks the form.
 * - **Keeping an impossible date.** When focus leaves a complete field, React Aria moves an
 *   impossible day to the month's last and reports that date (`confirmPlaceholder`); it skips this
 *   for a read-only field. So while the typed date is impossible, the field is read-only for exactly
 *   the blur that leaves it: `onBlurCapture` on a wrapper of the input turns it on before React
 *   Aria's blur handler runs, and the field's own `onBlur`, which runs after it, turns it off again.
 *
 * `shown` (`YYYY-MM-DD` or `""`) is what the hidden `name` input posts.
 */
export function useShownDate(props: ValueProps) {
  const { value, defaultValue, onChange, isRequired } = props;
  const [inner, setInner] = useState<CalendarDate | null>(value ?? defaultValue ?? null);
  const [read, setRead] = useState<Read>({
    typed: toISODate(inner),
    impossible: null,
    partial: false,
  });
  const side = useLeaving(read.impossible);
  const shown = withinRange(read.typed, props);
  const reported = useRef(shown);
  const report = useRef(onChange);
  useEffect(() => {
    report.current = onChange;
  });

  const given = value === undefined ? undefined : toISODate(value);
  const givenShown = withinRange(given ?? "", props);
  const lastGiven = useRef(given);
  useEffect(() => {
    if (given === lastGiven.current) return;
    lastGiven.current = given;
    if (given === undefined || given === reported.current) return;
    reported.current = givenShown;
    setInner(fromISODate(given));
  }, [given, givenShown]);

  const onRead = useCallback((next: Read) => setRead(next), []);

  useEffect(() => {
    if (shown === reported.current) return;
    reported.current = shown;
    report.current?.(fromISODate(shown));
  }, [shown]);

  return {
    inner,
    setInner,
    shown,
    impossible: read.impossible,
    onRead,
    validate: () => (isRequired && read.partial ? "Enter the whole date." : null),
    ...side,
  };
}

/**
 * The `leaving` read-only trick for one group of segments (see `useShownDate`): `onBlurCapture` goes
 * on a wrapper of the input and `onLeft` is the field's own `onBlur`.
 */
function useLeaving(impossible: string | null) {
  const [leaving, setLeaving] = useState(false);
  return {
    leaving,
    onBlurCapture: (event: FocusEvent<HTMLElement>) => {
      if (impossible && !event.currentTarget.contains(event.relatedTarget)) {
        flushSync(() => setLeaving(true));
      }
    },
    onLeft: () => setLeaving(false),
  };
}

/** A from and to date, both days. */
export type ShownRange = { start: CalendarDate; end: CalendarDate };

type RangeProps = {
  value?: ShownRange | null | undefined;
  defaultValue?: ShownRange | null | undefined;
  onChange?: ((range: ShownRange | null) => void) | undefined;
  minValue?: FieldProps["minValue"] | undefined;
  maxValue?: FieldProps["maxValue"] | undefined;
  isRequired?: boolean | undefined;
};

const blank: Read = { typed: "", impossible: null, partial: false };

/** `"start/end"` when both are dates and start is on or before end, else `""`. */
function rangeKey(start: string, end: string): string {
  return start && end && start <= end ? `${start}/${end}` : "";
}

function fromKey(key: string): ShownRange | null {
  const [start, end] = key.split("/").map(fromISODate);
  return start && end ? { start, end } : null;
}

/** The given range as `"start/end"`, each side kept only within `bounds` when they are passed. */
function givenKey(
  value: ShownRange | null,
  bounds: Pick<ValueProps, "minValue" | "maxValue"> | null,
): string {
  if (!value) return "";
  const [start, end] = [toISODate(value.start), toISODate(value.end)];
  return bounds
    ? rangeKey(withinRange(start, bounds), withinRange(end, bounds))
    : `${start}/${end}`;
}

/** An impossible day, naming its side, or else an end before the start; `null` for neither. */
function problemOf(start: Read, end: Read, startShown: string, endShown: string): string | null {
  const impossible = [
    start.impossible && `Start date: ${start.impossible}`,
    end.impossible && `End date: ${end.impossible}`,
  ].filter(Boolean);
  if (impossible.length > 0) return impossible.join(" ");
  if (startShown && endShown && startShown > endShown) {
    return "The end date is before the start date.";
  }
  return null;
}

/**
 * `useShownDate` for a range: each side's segments are read on their own, and the range reported is
 * what both sides show, once both are complete, real dates within min/max and the start is on or
 * before the end; otherwise `null`. Each side keeps an impossible day on blur with its own `leaving`
 * state, so one side is read-only only for the blur that leaves it. `problem` is the message for an
 * impossible day, naming its side, or for an end before the start. `startShown` and `endShown`, what
 * the hidden inputs post, are `""` while there is no range.
 */
export function useShownRange(props: RangeProps) {
  const { value, defaultValue, onChange, isRequired } = props;
  const [inner, setInner] = useState<ShownRange | null>(value ?? defaultValue ?? null);
  const [start, setStart] = useState<Read>({ ...blank, typed: toISODate(inner?.start) });
  const [end, setEnd] = useState<Read>({ ...blank, typed: toISODate(inner?.end) });
  const onReadStart = useCallback((next: Read) => setStart(next), []);
  const onReadEnd = useCallback((next: Read) => setEnd(next), []);
  const startSide = useLeaving(start.impossible);
  const endSide = useLeaving(end.impossible);
  const startShown = withinRange(start.typed, props);
  const endShown = withinRange(end.typed, props);
  const shown = rangeKey(startShown, endShown);
  const problem = problemOf(start, end, startShown, endShown);
  const reported = useRef(shown);
  const report = useRef(onChange);
  useEffect(() => {
    report.current = onChange;
  });

  const given = value === undefined ? undefined : givenKey(value, null);
  const givenShown = givenKey(value ?? null, props);
  const lastGiven = useRef(given);
  useEffect(() => {
    if (given === lastGiven.current) return;
    lastGiven.current = given;
    if (given === undefined || given === reported.current) return;
    reported.current = givenShown;
    setInner(fromKey(given));
  }, [given, givenShown]);

  useEffect(() => {
    if (shown === reported.current) return;
    reported.current = shown;
    report.current?.(fromKey(shown));
  }, [shown]);

  return {
    inner,
    setInner,
    startShown: shown ? startShown : "",
    endShown: shown ? endShown : "",
    problem,
    onReadStart,
    onReadEnd,
    validate: () => (isRequired && (start.partial || end.partial) ? "Enter the whole date." : null),
    start: startSide,
    end: endSide,
  };
}

/** The hidden input a form posts under `name`: the shown date as `YYYY-MM-DD`, or `""`. */
export function ShownInput({
  name,
  shown,
  isDisabled,
}: {
  name: string | undefined;
  shown: string;
  isDisabled: boolean | undefined;
}): ReactElement | null {
  return name ? <input type="hidden" name={name} value={shown} disabled={isDisabled} /> : null;
}
