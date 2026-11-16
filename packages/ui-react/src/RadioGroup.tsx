import { createContext, type ReactElement, type ReactNode, useContext, useId } from "react";
import {
  FieldError,
  Label,
  Radio as AriaRadio,
  RadioGroup as AriaRadioGroup,
  Text,
} from "react-aria-components";
import { cx } from "./cx.js";
import { definedProps, type Passthrough } from "./props.js";
import type { Size } from "./size.js";
import { WaitingChoice } from "./fieldWait.js";
import { BusyLabel, busy, type LoadingProps, LoadingScope, useLoading } from "./skeleton.js";

/** A radio's circle, its dot, its drop onto the label's first line and the label's text, by the group's `size`. */
const SIZE: Record<Size, { circle: string; dot: string; label: string; gap: string }> = {
  sm: { circle: "mt-px h-3.5 w-3.5", dot: "h-1.5 w-1.5", label: "text-xs", gap: "gap-2" },
  md: { circle: "mt-0.5 h-4 w-4", dot: "h-2 w-2", label: "text-sm", gap: "gap-2.5" },
  lg: { circle: "mt-0.5 h-5 w-5", dot: "h-2.5 w-2.5", label: "text-base", gap: "gap-3" },
};

/** The group's `size`, read by each `Radio` in it. */
const RadioSize = createContext<Size>("md");

/**
 * A named group of radios, one chosen. The `label` names the group; `hint` is a muted line under
 * the options that says more (the group's description); an `error` replaces it with a red line
 * (`role="alert"`) and marks the group invalid. Give it `value` and `onChange`, or
 * `defaultValue` and let it keep the choice. `name` posts the choice in a form.
 * The arrow keys move between the radios and choose, and the group is one tab stop. `size` sizes
 * every radio in the group, the same scale as a `Checkbox`. While `loading` the labels are drawn and
 * each circle is a bone.
 */
export function RadioGroup({
  label,
  hint,
  error,
  size = "md",
  disabled,
  required,
  loading,
  loadingLabel,
  children,
  ...rest
}: {
  /** The group's visible name, above the options. */
  label: ReactNode;
  /** A muted line under the options that says more; it describes the group. Replaced by `error`. */
  hint?: ReactNode;
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
  disabled?: boolean | undefined;
  /** Marks the choice required: the group is `aria-required`, and a form will not submit with no option chosen. */
  required?: boolean | undefined;
  /**
   * The size of every radio in the group: `sm` is `text-xs` and a smaller circle, `lg` `text-base`
   * and a larger one.
   * @default md
   */
  size?: Size;
  /** The `Radio`s. */
  children: ReactNode;
} & LoadingProps &
  Passthrough): ReactElement {
  const { loading: waiting, owner } = useLoading(loading);
  return (
    <AriaRadioGroup
      {...definedProps(rest)}
      {...(error ? { isInvalid: true } : {})}
      {...(disabled ? { isDisabled: true } : {})}
      {...(required ? { isRequired: true } : {})}
      className="flex flex-col gap-2"
    >
      <Label className="text-sm font-medium text-slate-700">{label}</Label>
      <div {...busy(owner, waiting)} className="flex flex-col gap-2.5">
        <RadioSize.Provider value={size}>
          <LoadingScope loading={waiting}>{children}</LoadingScope>
        </RadioSize.Provider>
        <BusyLabel owner={owner} loading={waiting} label={loadingLabel} />
      </div>
      {hint && !error ? (
        <Text slot="description" className="text-xs text-slate-500">
          {hint}
        </Text>
      ) : null}
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

/** The props of a `Radio`. */
type RadioProps = {
  /** The text beside the circle. */
  label: ReactNode;
  /** A muted line under the label that says more. It is the radio's `aria-describedby`. */
  hint?: ReactNode;
  /** What the group's `value` becomes when this one is chosen. */
  value: string;
  /** Disables this radio alone. */
  disabled?: boolean | undefined;
} & Passthrough;

/** One option of a `RadioGroup`: a `label` and, under it, an optional `hint`. Click the label or the circle. While `loading` the circle is a bone. */
export function Radio({
  loading,
  loadingLabel,
  ...props
}: RadioProps & LoadingProps): ReactElement {
  const size = SIZE[useContext(RadioSize)];
  if (useLoading(loading).loading) {
    return (
      <WaitingChoice
        own={loading}
        loadingLabel={loadingLabel}
        label={props.label}
        look={cx(size.gap, size.label)}
        shape={cx(size.circle, "rounded-full")}
        attrs={props}
      />
    );
  }
  return <ShownRadio {...props} />;
}

/** A radio with its circle drawn. */
function ShownRadio({
  label,
  hint,
  value,
  disabled,
  "aria-describedby": describedBy,
  ...rest
}: RadioProps): ReactElement {
  const descriptionId = useId();
  const size = SIZE[useContext(RadioSize)];
  return (
    <AriaRadio
      {...definedProps(rest)}
      value={value}
      {...(describedBy || hint
        ? {
            "aria-describedby": [describedBy, hint ? descriptionId : undefined]
              .filter(Boolean)
              .join(" "),
          }
        : {})}
      {...(disabled ? { isDisabled: true } : {})}
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
            {hint ? (
              <span id={descriptionId} className="text-xs text-slate-500">
                {hint}
              </span>
            ) : null}
          </span>
        </>
      )}
    </AriaRadio>
  );
}
