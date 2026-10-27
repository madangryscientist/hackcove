import {
  useRef,
  useState,
  type ChangeEvent,
  type ComponentPropsWithoutRef,
  type ReactElement,
  type ReactNode,
} from "react";
import {
  CONTROL_ALIGN,
  controlClass,
  type ControlAlign,
  type ControlProps,
  type ControlSize,
} from "./control.js";
import { cx, focusRing } from "./cx.js";
import { InputShell } from "./InputShell.js";
import type { Unstyled } from "./props.js";

/** The browser's own search look is reset: no `searchfield` appearance, no cancel button or decoration. The clear button below replaces them. */
const SEARCH_RESET =
  "appearance-none [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden [&::-webkit-search-results-button]:hidden [&::-webkit-search-results-decoration]:hidden";

/** A search field's padding: the leading side as a plain field or with an icon, the trailing side clear of the clear button. */
const SEARCH_PAD: Record<ControlSize, { plain: string; icon: string }> = {
  sm: { plain: "pl-2 pr-7", icon: "pl-7 pr-7" },
  md: { plain: "pl-3 pr-9", icon: "pl-9 pr-9" },
  lg: { plain: "pl-4 pr-11", icon: "pl-11 pr-11" },
};

/** The clear button's place and box, and its icon, by the field's size. */
const CLEAR_SIZE: Record<ControlSize, { box: string; icon: string }> = {
  sm: { box: "right-1 h-5 w-5", icon: "h-3 w-3" },
  md: { box: "right-2 h-6 w-6", icon: "h-3.5 w-3.5" },
  lg: { box: "right-2.5 h-7 w-7", icon: "h-4 w-4" },
};

const CLEAR_BUTTON = `absolute top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded text-slate-500 hover:bg-slate-100 ${focusRing}`;

type ValueDescriptor = { set?: (this: HTMLInputElement, value: string) => void };

/** Set `value` the way a keystroke does (past React's value tracker), so `onChange` fires for a controlled and an uncontrolled field alike. */
function clearValue(input: HTMLInputElement): void {
  const descriptor: ValueDescriptor | undefined = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value",
  );
  descriptor?.set?.call(input, "");
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.focus();
}

function ClearButton({ size, onClear }: { size: ControlSize; onClear: () => void }): ReactElement {
  return (
    <button
      type="button"
      aria-label="Clear search"
      title="Clear search"
      onClick={onClear}
      className={cx(CLEAR_BUTTON, CLEAR_SIZE[size].box)}
    >
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
        className={CLEAR_SIZE[size].icon}
      >
        <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L8.94 10l-4.72 4.72a.75.75 0 1 0 1.06 1.06L10 11.06l4.72 4.72a.75.75 0 1 0 1.06-1.06L11.06 10l4.72-4.72a.75.75 0 0 0-1.06-1.06L10 8.94 5.28 4.22Z" />
      </svg>
    </button>
  );
}

/** `Input` for `type="search"`: native search look reset, and a "Clear search" button at the trailing edge while the field has a value. */
export function SearchInput({
  icon,
  size = "md",
  width = "full",
  align = "start",
  onChange,
  ...rest
}: { icon?: ReactNode; align?: ControlAlign | undefined } & ControlProps &
  Unstyled<Omit<ComponentPropsWithoutRef<"input">, "size" | "width">>): ReactElement {
  const inputRef = useRef<HTMLInputElement>(null);
  const [typed, setTyped] = useState(() => String(rest.value ?? rest.defaultValue ?? "") !== "");
  const filled = rest.value !== undefined ? String(rest.value) !== "" : typed;
  return (
    <InputShell icon={icon} size={size} width={width}>
      <input
        {...rest}
        ref={inputRef}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          setTyped(event.currentTarget.value !== "");
          onChange?.(event);
        }}
        className={cx(
          controlClass(size, width === "auto" ? "auto" : "full"),
          SEARCH_PAD[size][icon === undefined ? "plain" : "icon"],
          SEARCH_RESET,
          CONTROL_ALIGN[align],
        )}
      />
      {filled && !rest.disabled && !rest.readOnly && (
        <ClearButton size={size} onClear={() => inputRef.current && clearValue(inputRef.current)} />
      )}
    </InputShell>
  );
}
