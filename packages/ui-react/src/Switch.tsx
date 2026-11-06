import type { ComponentPropsWithoutRef, ReactElement, ReactNode } from "react";
import { cx, focusRing } from "./cx.js";
import { useDescription, Words } from "./labelWords.js";
import type { Unstyled } from "./props.js";
import type { Size } from "./size.js";

/**
 * The label's gap and text, the track, its thumb and the thumb's slide, by `size`. The track is a
 * 2px border plus 2px of padding, so the thumb is the track's height less 8px and slides the
 * track's width less 8px less its own width.
 */
const SIZE: Record<Size, { label: string; track: string; thumb: string; slide: string }> = {
  sm: { label: "gap-2 text-xs", track: "h-5 w-9", thumb: "h-3 w-3", slide: "translate-x-4" },
  md: { label: "gap-2.5 text-sm", track: "h-6 w-11", thumb: "h-4 w-4", slide: "translate-x-5" },
  lg: { label: "gap-3 text-base", track: "h-7 w-13", thumb: "h-5 w-5", slide: "translate-x-6" },
};

// Off is an outline of the text colour with a thumb of the same colour; on is the accent filled,
// with a thumb in its pale text colour. `border-current` and `bg-current` are no palette colour.
const OFF = "border-current text-slate-500";
const ON = "border-violet-600 bg-violet-600 text-violet-50";

type Naming =
  | {
      /** The text beside the switch; the whole label is a click target. */
      label: NonNullable<ReactNode>;
      "aria-label"?: string | undefined;
    }
  | {
      label?: undefined;
      /** A bare switch (a table cell) has no words to name it: this is its name. */
      "aria-label": string;
    };

type SwitchProps = Naming & {
  /** Whether it is on. The caller owns it: there is no uncontrolled mode. */
  checked: boolean;
  /** Called with the next value when the person flips it. Not called while `busy`. */
  onChange: (checked: boolean) => void;
  /** A muted line under the label that says more. It is the switch's `aria-describedby`. */
  description?: ReactNode;
  /**
   * The label's text size and the switch with it.
   * @default md
   */
  size?: Size | undefined;
  /**
   * The change is being saved: `aria-busy`, and a click or a key does nothing. It keeps its colour
   * and its focus, which a native `disabled` would lose when the save starts.
   */
  busy?: boolean | undefined;
} & Unstyled<
    Omit<
      ComponentPropsWithoutRef<"button">,
      | "type"
      | "role"
      | "children"
      | "onChange"
      | "aria-checked"
      | "aria-busy"
      | "aria-disabled"
      | "aria-label"
    >
  >;

/** `not-allowed` for a disabled switch, `progress` for a busy one, and the pointer otherwise. */
function cursorOf(disabled: boolean | undefined, busy: boolean): string {
  if (disabled) return "cursor-not-allowed";
  return busy ? "cursor-progress" : "cursor-pointer";
}

/** A disabled switch washes out as a Button does; a busy one is only a little dimmer. */
function washOf(disabled: boolean | undefined, busy: boolean): string {
  return cx(cursorOf(disabled, busy), disabled && "opacity-50", busy && "opacity-85");
}

/** The switch itself: the track, with the thumb in it. */
function Track({
  checked,
  onChange,
  size,
  busy,
  disabled,
  onClick,
  className,
  ...rest
}: Pick<SwitchProps, "checked" | "onChange" | "disabled" | "onClick"> & {
  size: Size;
  busy: boolean;
  className: string;
} & Omit<ComponentPropsWithoutRef<"button">, "onChange" | "className" | "disabled" | "onClick">) {
  const { track, thumb, slide } = SIZE[size];
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-busy={busy || undefined}
      aria-disabled={busy || undefined}
      disabled={disabled}
      className={cx(
        "inline-flex shrink-0 items-center rounded-full border-2 p-0.5",
        track,
        checked ? ON : OFF,
        className,
        focusRing,
      )}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || busy) return;
        onChange(!checked);
      }}
      {...rest}
    >
      <span
        aria-hidden="true"
        className={cx(
          "block rounded-full bg-current transition-transform motion-reduce:transition-none",
          thumb,
          checked ? slide : "translate-x-0",
        )}
      />
    </button>
  );
}

/**
 * An on/off switch for a setting that takes effect at once, usually by saving it to a server: a
 * native `<button role="switch" aria-checked>`. It is controlled: the caller owns `checked` and
 * flips it in `onChange`. A value sent with a form is a `Checkbox`, not a Switch. Give it a `label`
 * (the whole label is the click target), or in a table cell leave the label out and name it with
 * `aria-label`. `description` is a muted line under the label, and the switch's
 * `aria-describedby`. `size` is `sm`, `md` (the default) or `lg`. `busy` is for the save in
 * flight: clicks and keys do nothing, and the switch keeps its colour and its focus. `disabled` is
 * the native one, washed out.
 */
export function Switch({
  label,
  description,
  size = "md",
  busy = false,
  "aria-describedby": describedBy,
  ...rest
}: SwitchProps): ReactElement {
  const { descriptionId, describedIds } = useDescription(description, describedBy);
  const wash = washOf(rest.disabled, busy);
  const track = (
    <Track
      {...rest}
      size={size}
      busy={busy}
      className={label === undefined ? wash : cursorOf(rest.disabled, busy)}
      {...(describedIds ? { "aria-describedby": describedIds } : {})}
    />
  );
  if (label === undefined) return track;
  const start = descriptionId !== undefined;
  return (
    <label
      className={cx(
        "inline-flex text-slate-700",
        start ? "items-start" : "items-center",
        SIZE[size].label,
        wash,
      )}
    >
      {track}
      <span className={cx(start && "mt-0.5")}>
        <Words label={label} description={description} id={descriptionId} />
      </span>
    </label>
  );
}
