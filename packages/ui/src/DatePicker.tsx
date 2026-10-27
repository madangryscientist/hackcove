import type { CalendarDate } from "@internationalized/date";
import { type ReactElement, type ReactNode, useCallback, useContext, useState } from "react";
import {
  Button,
  DatePicker as AriaDatePicker,
  DateFieldContext,
  DateInput,
  Group,
  I18nProvider,
  Label,
} from "react-aria-components";
import { cx } from "./cx.js";
import { CalendarPopover, calendarIcon } from "./DateCalendar.js";
import {
  type DateFieldProps,
  FieldSegment,
  LOCALE,
  forcedInvalid,
  Notes,
  frameClass,
  iconButtonLook,
  labelClass,
} from "./DateField.js";
import { ShownInput, useShownDate } from "./shownDate.js";
import type { Size } from "./size.js";

/** The picker's padding, text and calendar button, by `size`. The button sets the height, so the padding is less than a `DateField`'s. */
const PICKER_SIZE: Record<Size, { frame: string; button: string }> = {
  sm: { frame: "py-0.5 pl-2 pr-0.5 text-xs", button: "h-5 w-5" },
  md: { frame: "py-2 pl-2.5 pr-1 text-sm", button: "h-7 w-7" },
  lg: { frame: "py-1.5 pl-3 pr-1.5 text-base", button: "h-8 w-8" },
};

export type DatePickerProps = DateFieldProps & {
  /** Open the calendar on mount. */
  defaultOpen?: boolean;
};

/**
 * The picker's input, read-only while `leaving`. Only the field: a read-only picker would also
 * disable the calendar button that focus may be moving to.
 */
function PickerInput({
  leaving,
  onLeft,
  children,
}: {
  leaving: boolean;
  onLeft: () => void;
  children: ReactNode;
}): ReactElement {
  const field = useContext(DateFieldContext);
  return (
    <DateFieldContext.Provider value={{ ...field, isReadOnly: leaving, onBlur: onLeft }}>
      {children}
    </DateFieldContext.Provider>
  );
}

/** A `DateField` with a calendar button that opens a month view in a popover. */
export function DatePicker({
  label,
  description,
  errorMessage,
  error,
  isInvalid: invalidProp,
  value,
  defaultValue,
  onChange,
  name,
  size = "md",
  ...rest
}: DatePickerProps): ReactElement {
  const { inner, setInner, shown, impossible, onRead, validate, leaving, onBlurCapture, onLeft } =
    useShownDate({
      value,
      defaultValue,
      onChange,
      minValue: rest.minValue,
      maxValue: rest.maxValue,
      isRequired: rest.isRequired,
    });
  const [dialog, setDialog] = useState<Element | undefined>(undefined);
  const findDialog = useCallback(
    (el: HTMLDivElement | null) => setDialog(el?.closest("dialog") ?? undefined),
    [],
  );
  return (
    <I18nProvider locale={LOCALE}>
      <AriaDatePicker<CalendarDate>
        {...rest}
        ref={findDialog}
        value={inner}
        onChange={setInner}
        validate={validate}
        {...forcedInvalid({ impossible, isInvalid: invalidProp, error })}
        granularity="day"
        shouldForceLeadingZeros
        className="flex flex-col gap-1.5"
      >
        {({ isInvalid }) => (
          <>
            {label ? <Label className={labelClass}>{label}</Label> : null}
            <Group className={(state) => cx(frameClass(state), "gap-1", PICKER_SIZE[size].frame)}>
              <div className="contents" onBlurCapture={onBlurCapture}>
                <PickerInput leaving={leaving} onLeft={onLeft}>
                  <DateInput className="flex flex-1">
                    {(segment) => (
                      <FieldSegment
                        segment={segment}
                        {...(segment.type === "day" ? { onRead } : {})}
                      />
                    )}
                  </DateInput>
                </PickerInput>
              </div>
              <Button className={cx(iconButtonLook, PICKER_SIZE[size].button)}>
                {calendarIcon}
              </Button>
            </Group>
            <ShownInput name={name} shown={shown} isDisabled={rest.isDisabled} />
            <Notes
              description={description}
              errorMessage={errorMessage}
              error={error}
              impossible={impossible}
              isInvalid={isInvalid}
            />
            <CalendarPopover container={dialog} />
          </>
        )}
      </AriaDatePicker>
    </I18nProvider>
  );
}
