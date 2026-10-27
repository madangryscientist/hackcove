import { type AriaAttributes, type ReactElement, type ReactNode, useId } from "react";
import {
  FieldError,
  Label,
  Radio as AriaRadio,
  RadioGroup as AriaRadioGroup,
  type RadioGroupProps as AriaRadioGroupProps,
} from "react-aria-components";
import { cx } from "./cx.js";
import type { DataAttributes } from "./link.js";

/**
 * A named group of radios, one chosen. The `label` names the group; an `error` is a red line under
 * it with `role="alert"` and marks the group invalid. Give it `value` and `onChange`, or
 * `defaultValue` and let it keep the choice. `name` posts the choice in a form.
 * The arrow keys move between the radios and choose, and the group is one tab stop.
 */
export function RadioGroup({
  label,
  error,
  children,
  ...rest
}: {
  label: ReactNode;
  /** Shown under the options in red with `role="alert"`; marks the group invalid. Like `Field`'s `error`. */
  error?: ReactNode;
  /** The `value` of the chosen radio. */
  value?: string;
  /** The `value` chosen to begin with, when the group keeps its own choice. */
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** The form field the choice posts under. */
  name?: string;
  /** Disables every radio. */
  isDisabled?: boolean;
  isRequired?: boolean;
  /** The `Radio`s. */
  children: ReactNode;
} & DataAttributes &
  Pick<
    AriaRadioGroupProps,
    "aria-label" | "aria-labelledby" | "aria-describedby" | "aria-details"
  >): ReactElement {
  return (
    <AriaRadioGroup
      {...rest}
      {...(error ? { isInvalid: true } : {})}
      className="flex flex-col gap-2"
    >
      <Label className="text-sm font-medium text-slate-700">{label}</Label>
      <div className="flex flex-col gap-2.5">{children}</div>
      <FieldError className="text-xs text-red-700">
        <span role="alert">{error}</span>
      </FieldError>
    </AriaRadioGroup>
  );
}

function ringTone(invalid: boolean, selected: boolean): string {
  if (invalid) return "border-red-600";
  return selected ? "border-violet-600" : "border-slate-300";
}

/** One option of a `RadioGroup`: a `label` and, under it, an optional `description`. Click the label or the circle. */
export function Radio({
  label,
  description,
  value,
  isDisabled,
  "aria-describedby": describedBy,
  ...rest
}: {
  label: ReactNode;
  /** A muted line under the label that says more. It is the radio's `aria-describedby`. */
  description?: ReactNode;
  /** What the group's `value` becomes when this one is chosen. */
  value: string;
  isDisabled?: boolean;
} & DataAttributes &
  Pick<AriaAttributes, "aria-describedby">): ReactElement {
  const descriptionId = useId();
  return (
    <AriaRadio
      {...rest}
      value={value}
      {...(describedBy || description
        ? {
            "aria-describedby": [describedBy, description ? descriptionId : undefined]
              .filter(Boolean)
              .join(" "),
          }
        : {})}
      {...(isDisabled ? { isDisabled } : {})}
      className={({ isDisabled: off }) =>
        cx(
          "flex cursor-pointer items-start gap-2.5 rounded-md has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-violet-600",
          off && "cursor-default opacity-50",
        )
      }
    >
      {({ isSelected, isInvalid }) => (
        <>
          <span
            aria-hidden="true"
            className={cx(
              "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border bg-white transition hover:border-violet-400",
              ringTone(isInvalid, isSelected),
            )}
          >
            {isSelected ? <span className="h-2 w-2 rounded-full bg-violet-600" /> : null}
          </span>
          <span className="flex flex-col gap-0.5">
            <span className="text-sm text-slate-700">{label}</span>
            {description ? (
              <span id={descriptionId} className="text-xs text-slate-500">
                {description}
              </span>
            ) : null}
          </span>
        </>
      )}
    </AriaRadio>
  );
}
