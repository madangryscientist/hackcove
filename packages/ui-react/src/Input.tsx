import type { ComponentPropsWithoutRef, ReactElement, Ref } from "react";
import { CONTROL_PAD, controlClass, type ControlProps, NUMERIC_VALUE } from "./control.js";
import { cx } from "./cx.js";
import { useTypeStep } from "./density.js";
import { Icon } from "./Icon.js";
import type { IconName } from "./icons.js";
import { InputShell, PrefixShell } from "./InputShell.js";
import type { Unstyled } from "./props.js";
import { SearchInput } from "./SearchInput.js";
import { useFieldControl } from "./fieldControl.js";

/**
 * A text input. `icon` names a leading icon inside the field (`icon="search"`). `prefix` puts
 * short text inside the border before the value, such as a currency symbol; it is for a plain
 * field, not with an `icon` or `type="search"`. `numeric` is a field for a figure: an amount
 * (`<Input prefix="R" numeric />`) or a count (`numeric inputMode="numeric"`). It right-aligns the
 * value in tabular figures and brings up the phone's number keypad (`inputMode="decimal"` unless
 * you pass your own), and stays a text field, so "1 250" is kept as typed; never use
 * `type="number"` for a figure a person types. `type="search"` drops the browser's own search look and shows a clear button at the
 * trailing edge while the field has a value, named by `clearLabel`. The `ref` reaches the `<input>`.
 */
export function Input({
  icon,
  prefix,
  size = "md",
  width = "full",
  numeric,
  clearLabel,
  ...own
}: (
  | {
      /** A leading icon inside the field, by name (`search`). Not with `prefix`. */
      icon?: IconName | undefined;
      /** Short text inside the border before the value (a currency symbol). For a plain field: not with `icon` or `type="search"`. */
      prefix?: undefined;
    }
  | {
      /** A leading icon inside the field, by name (`search`). Not with `prefix`. */
      icon?: undefined;
      /** Short text inside the border before the value (a currency symbol). For a plain field: not with `icon` or `type="search"`. */
      prefix: string;
    }
) &
  ControlProps & {
    /**
     * A field for a figure (an amount, a count): the value right-aligned in tabular figures, and
     * `inputMode="decimal"` unless you pass your own (`numeric` for a whole number). It stays a
     * text field, so the value is kept as typed; parsing it is yours. Ignored on `type="search"`.
     * @default false
     */
    numeric?: boolean | undefined;
    /**
     * The name of a `type="search"` field's clear button, for an app in another language.
     * @default Clear search
     */
    clearLabel?: string | undefined;
    /** The `<input>` itself, for focus control. */
    ref?: Ref<HTMLInputElement> | undefined;
  } & Unstyled<
    Omit<ComponentPropsWithoutRef<"input">, "size" | "width" | "prefix">
  >): ReactElement {
  const step = useTypeStep();
  const { rest, value } = asFigure({ ...own, ...useFieldControl(own) }, numeric);
  const glyph = icon === undefined ? undefined : <Icon name={icon} />;
  if (rest.type === "search") {
    return (
      <SearchInput
        {...rest}
        icon={glyph}
        size={size}
        width={width}
        clearLabel={clearLabel ?? "Clear search"}
      />
    );
  }
  if (prefix !== undefined) {
    return (
      <PrefixShell prefix={prefix} size={size} width={width} disabled={rest.disabled}>
        <input
          {...rest}
          className={cx(
            "min-w-0 flex-1 bg-transparent px-1 text-ellipsis outline-none placeholder:text-slate-400",
            value,
          )}
        />
      </PrefixShell>
    );
  }
  if (glyph === undefined) {
    return (
      <input
        {...rest}
        className={cx(controlClass(size, width, step), CONTROL_PAD[size].x, value)}
      />
    );
  }
  return (
    <InputShell icon={glyph} size={size} width={width}>
      <input
        {...rest}
        className={cx(
          controlClass(size, width === "auto" ? "auto" : "full", step),
          CONTROL_PAD[size].icon,
          value,
        )}
      />
    </InputShell>
  );
}

/**
 * A `numeric` field's props and value class: the decimal keypad unless the caller chose one, and
 * right-aligned tabular figures. A search field is never a figure.
 */
function asFigure<P extends { type?: string | undefined; inputMode?: InputMode | undefined }>(
  props: P,
  numeric: boolean | undefined,
): { rest: P; value: string | undefined } {
  if (!numeric || props.type === "search") return { rest: props, value: undefined };
  return { rest: { ...props, inputMode: props.inputMode ?? "decimal" }, value: NUMERIC_VALUE };
}

type InputMode = ComponentPropsWithoutRef<"input">["inputMode"];
