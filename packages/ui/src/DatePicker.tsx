import type { CalendarDate } from "@internationalized/date";
import { type ReactElement, type ReactNode, useContext } from "react";
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
  Notes,
  frameClass,
  iconButtonClass,
  labelClass,
} from "./DateField.js";
import { ShownInput, useShownDate } from "./shownDate.js";

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
  className,
  value,
  defaultValue,
  onChange,
  name,
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
  return (
    <I18nProvider locale={LOCALE}>
      <AriaDatePicker<CalendarDate>
        {...rest}
        value={inner}
        onChange={setInner}
        validate={validate}
        {...(impossible ? { isInvalid: true } : {})}
        granularity="day"
        shouldForceLeadingZeros
        className={cx("flex flex-col gap-1.5", className)}
      >
        {({ isInvalid }) => (
          <>
            {label ? <Label className={labelClass}>{label}</Label> : null}
            <Group className={(state) => cx(frameClass(state), "gap-1 pr-1")}>
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
              <Button className={iconButtonClass}>{calendarIcon}</Button>
            </Group>
            <ShownInput name={name} shown={shown} isDisabled={rest.isDisabled} />
            <Notes
              description={description}
              errorMessage={errorMessage}
              impossible={impossible}
              isInvalid={isInvalid}
            />
            <CalendarPopover />
          </>
        )}
      </AriaDatePicker>
    </I18nProvider>
  );
}
