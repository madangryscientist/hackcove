import { useSyncExternalStore, type ComponentPropsWithoutRef, type ReactElement } from "react";
import {
  appliedColourScheme,
  applyColourScheme,
  storeColourScheme,
  type ColourScheme,
  type ColourSchemeClasses,
} from "./colourScheme.js";
import { IconButton } from "./IconButton.js";

const sun = (
  <svg
    viewBox="0 0 24 24"
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);

const moon = (
  <svg
    viewBox="0 0 24 24"
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
  </svg>
);

// The scheme's class on <html> is the source of truth: the head script or the server set it before React ran.
function subscribe(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

/**
 * A sun/moon button that switches `<html>` between light and dark and remembers the choice. It shows the scheme you would switch to. Pair it with `colourSchemeScript` in `<head>`, unless you pass `schemes` or `initial`: the script knows only the `dark` class and the stored choice, so an app that sets the scheme itself leaves it out.
 *
 * An app whose light scheme has a class of its own passes `schemes` (`{ light: "paper", dark: "dark" }`);
 * the toggle swaps those classes, and `schemeClass` gives the same one for the server to render on `<html>`.
 * An app that knows the scheme on the server (from a cookie) passes it as `initial`, so the server
 * markup, the hydrating client and the `<html>` class agree; persist a change from `onChange`.
 * `store={false}` skips `localStorage`, for an app that keeps the choice in a server cookie and
 * writes it from `onChange`. Every other button prop (`id`, `data-*`, `aria-*`) goes on the button.
 */
export function ColourSchemeToggle({
  className,
  onChange,
  schemes = { light: "", dark: "dark" },
  initial,
  store = true,
  ...rest
}: {
  className?: string;
  onChange?: (scheme: ColourScheme) => void;
  /** The class each scheme puts on `<html>`. Default `{ light: "", dark: "dark" }`. */
  schemes?: ColourSchemeClasses | undefined;
  /** The scheme the server rendered. What the server and the hydrating client show; the real state follows right after. Default `"light"`. */
  initial?: ColourScheme | undefined;
  /** Remember the choice in `localStorage`. `false` leaves persisting to `onChange`. Default `true`. */
  store?: boolean | undefined;
} & Omit<
  ComponentPropsWithoutRef<"button">,
  "onChange" | "onClick" | "children" | "className" | "aria-label" | "title"
>): ReactElement {
  const scheme = useSyncExternalStore(
    subscribe,
    () => appliedColourScheme(document.documentElement, schemes),
    () => initial ?? "light",
  );
  const next: ColourScheme = scheme === "dark" ? "light" : "dark";
  return (
    <IconButton
      {...rest}
      label={`Switch to ${next} theme`}
      className={className}
      onClick={() => {
        applyColourScheme(next, document.documentElement, schemes);
        if (store) storeColourScheme(next);
        onChange?.(next);
      }}
    >
      {next === "light" ? sun : moon}
    </IconButton>
  );
}
