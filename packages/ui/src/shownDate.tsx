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
import type { DateFieldProps, Read } from "./DateField.js";
import { fromISODate, toISODate } from "./isoDate.js";

type ValueKeys = "value" | "defaultValue" | "onChange" | "minValue" | "maxValue" | "isRequired";
/** The value props, each of which may be passed as `undefined`. */
type ValueProps = { [K in ValueKeys]?: DateFieldProps[K] | undefined };

/** `iso` when it is a date within min/max, else `""`. */
function withinRange(iso: string, { minValue, maxValue }: ValueProps): string {
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
  const [leaving, setLeaving] = useState(false);
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
    leaving,
    onBlurCapture: (event: FocusEvent<HTMLElement>) => {
      if (read.impossible && !event.currentTarget.contains(event.relatedTarget)) {
        flushSync(() => setLeaving(true));
      }
    },
    onLeft: () => setLeaving(false),
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
