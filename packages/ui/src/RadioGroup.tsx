import {
  type AriaAttributes,
  createContext,
  type ReactElement,
  type ReactNode,
  useContext,
  useId,
} from "react";
import {
  FieldError,
  Label,
  Radio as AriaRadio,
  RadioGroup as AriaRadioGroup,
  type RadioGroupProps as AriaRadioGroupProps,
} from "react-aria-components";
import { cx } from "./cx.js";
import type { DataAttributes } from "./link.js";
import type { Size } from "./size.js";

/** A radio's circle, its dot, its drop onto the label's first line and the label's text, by the group's `size`. */
const SIZE: Record<Size, { circle: string; dot: string; label: string; gap: string }> = {
  sm: { circle: "mt-px h-3.5 w-3.5", dot: "h-1.5 w-1.5", label: "text-xs", gap: "gap-2" },
  md: { circle: "mt-0.5 h-4 w-4", dot: "h-2 w-2", label: "text-sm", gap: "gap-2.5" },
  lg: { circle: "mt-0.5 h-5 w-5", dot: "h-2.5 w-2.5", label: "text-base", gap: "gap-3" },
};

/** The group's `size`, read by each `Radio` in it. */
const RadioSize = createContext<Size>("md");

/**
 * A named group of radios, one chosen. The `label` names the group; an `error` is a red line under
 * it with `role="alert"` and marks the group invalid. Give it `value` and `onChange`, or
 * `defaultValue` and let it keep the choice. `name` posts the choice in a form.
 * The arrow keys move between the radios and choose, and the group is one tab stop. `size` sizes
 * every radio in the group, the same scale as a `Checkbox`.
 */
export function RadioGroup({
  label,
  error,
  size = "md",
  children,
  ...rest
}: {
  /** The group's visible name, above the options. */
  label: ReactNode;
  /** Shown under the options in red with `role="alert"`; marks the group invalid. Like `Field`'s `error`. */
  error?: ReactNode;
  /** The `value` of the chosen radio. */
  value?: string;
  /** The `value` chosen to begin with, when the group keeps its own choice. */
  defaultValue?: string;
  /** Called with the chosen radio's `value`. */
  onChange?: (value: string) => void;
  /** The form field the choice posts under. */
  name?: string;
  /** Disables every radio. */
  isDisabled?: boolean;
  /** Marks the choice required: the group is `aria-required`, and a form will not submit with no option chosen. */
  isRequired?: boolean;
  /**
   * The size of every radio in the group: `sm` is `text-xs` and a smaller circle, `lg` `text-base`
   * and a larger one.
   * @default md
   */
  size?: Size;
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
      <div className="flex flex-col gap-2.5">
        <RadioSize.Provider value={size}>{children}</RadioSize.Provider>
      </div>
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
  /** The text beside the circle. */
  label: ReactNode;
  /** A muted line under the label that says more. It is the radio's `aria-describedby`. */
  description?: ReactNode;
  /** What the group's `value` becomes when this one is chosen. */
  value: string;
  /** Disables this radio alone. */
  isDisabled?: boolean;
} & DataAttributes &
  Pick<AriaAttributes, "aria-describedby">): ReactElement {
  const descriptionId = useId();
  const size = SIZE[useContext(RadioSize)];
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
          "flex cursor-pointer items-start rounded-md has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-violet-600",
          size.gap,
          off && "cursor-default opacity-50",
        )
      }
    >
      {({ isSelected, isInvalid }) => (
        <>
          <span
            aria-hidden="true"
            className={cx(
              "flex shrink-0 items-center justify-center rounded-full border bg-white transition hover:border-violet-400",
              size.circle,
              ringTone(isInvalid, isSelected),
            )}
          >
            {isSelected ? <span className={cx("rounded-full bg-violet-600", size.dot)} /> : null}
          </span>
          <span className="flex flex-col gap-0.5">
            <span className={cx("text-slate-700", size.label)}>{label}</span>
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
