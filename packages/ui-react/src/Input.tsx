import type { ComponentPropsWithoutRef, ReactElement, Ref } from "react";
import {
  CONTROL_ALIGN,
  CONTROL_PAD,
  controlClass,
  type ControlAlign,
  type ControlProps,
} from "./control.js";
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
 * field, not with an `icon` or `type="search"`. `align="end"` right-aligns the value, for a numeric
 * field. `type="search"` drops the browser's own search look and shows a clear button at the
 * trailing edge while the field has a value, named by `clearLabel`. The `ref` reaches the `<input>`.
 */
export function Input({
  icon,
  prefix,
  size = "md",
  width = "full",
  align = "start",
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
    /** `end` right-aligns the value, for a numeric field. `start` (default) leaves it as typed. */
    align?: ControlAlign | undefined;
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
  const rest = { ...own, ...useFieldControl(own) };
  const glyph = icon === undefined ? undefined : <Icon name={icon} />;
  if (rest.type === "search") {
    return (
      <SearchInput
        {...rest}
        icon={glyph}
        size={size}
        width={width}
        align={align}
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
            CONTROL_ALIGN[align],
          )}
        />
      </PrefixShell>
    );
  }
  if (glyph === undefined) {
    return (
      <input
        {...rest}
        className={cx(controlClass(size, width, step), CONTROL_PAD[size].x, CONTROL_ALIGN[align])}
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
          CONTROL_ALIGN[align],
        )}
      />
    </InputShell>
  );
}
