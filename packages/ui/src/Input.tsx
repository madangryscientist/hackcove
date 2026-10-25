import type { ComponentPropsWithoutRef, ReactElement, ReactNode } from "react";
import { CONTROL_PAD, controlClass, type ControlProps } from "./control.js";
import { cx } from "./cx.js";
import { InputShell } from "./InputShell.js";
import { SearchInput } from "./SearchInput.js";

/** A text input. `icon` puts a leading icon inside the field (e.g. a search glass). `type="search"` drops the browser's own search look and shows a "Clear search" button at the trailing edge while the field has a value. */
export function Input({
  icon,
  size = "md",
  width = "full",
  className,
  ...rest
}: { icon?: ReactNode } & ControlProps &
  Omit<ComponentPropsWithoutRef<"input">, "size" | "width">): ReactElement {
  if (rest.type === "search") {
    return <SearchInput {...rest} icon={icon} size={size} width={width} className={className} />;
  }
  if (icon === undefined) {
    return (
      <input {...rest} className={cx(controlClass(size, width), CONTROL_PAD[size].x, className)} />
    );
  }
  return (
    <InputShell icon={icon} size={size} width={width}>
      <input
        {...rest}
        className={cx(
          controlClass(size, width === "auto" ? "auto" : "full"),
          CONTROL_PAD[size].icon,
          className,
        )}
      />
    </InputShell>
  );
}
