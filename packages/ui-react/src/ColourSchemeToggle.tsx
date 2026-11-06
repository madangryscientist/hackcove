import { useSyncExternalStore, type ComponentPropsWithoutRef, type ReactElement } from "react";
import {
  appliedColourScheme,
  applyColourScheme,
  storeColourScheme,
  type ColourScheme,
  type ColourSchemeClasses,
} from "./colourScheme.js";
import { look } from "./IconButton.js";
import type { Unstyled } from "./props.js";
import type { Size } from "./size.js";

const sun = (
  <svg
    data-scheme-icon="sun"
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
    data-scheme-icon="moon"
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

// Both icons are always drawn and the page's own class picks one, so the first frame is right before
// React runs: a dark visitor with no cookie has the dark class on <html> from the head script, but the
// server rendered "light". The icon shows the scheme you would switch to: the moon on a light page,
// the sun on a dark one. The button's name is picked the same way: both "Switch to … theme" spans are
// always drawn and `display:none` takes the wrong one out of the accessible name too. The classes are
// the app's (`schemes`), so the rule is written here: a dark page has the dark class, or, when dark
// has none, lacks the light one.
function schemeRules(schemes: ColourSchemeClasses): string {
  const sunIcon = '[data-scheme-icon="sun"]';
  const moonIcon = '[data-scheme-icon="moon"]';
  const toLight = '[data-scheme-name="light"]';
  const toDark = '[data-scheme-name="dark"]';
  let dark = "";
  if (schemes.dark !== "") dark = `:root[class~=${JSON.stringify(schemes.dark)}]`;
  else if (schemes.light !== "") dark = `:root:not([class~=${JSON.stringify(schemes.light)}])`;
  return (
    `${sunIcon}{display:none}${toLight}{display:none}` +
    (dark === ""
      ? ""
      : `${dark} ${sunIcon}{display:inline}${dark} ${moonIcon}{display:none}` +
        `${dark} ${toLight}{display:inline}${dark} ${toDark}{display:none}`)
  );
}

// The scheme's class on <html> is the source of truth: the head script or the server set it before React ran.
function subscribe(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

// False in the server markup and while the client hydrates, true after: `title` is the one thing CSS
// cannot choose, so it is rendered only once the client knows the scheme.
const never = (): (() => void) => () => {};

/**
 * A sun/moon button that switches `<html>` between light and dark and remembers the choice. It shows the scheme you would switch to. Pair it with `colourSchemeScript` in `<head>`, unless you pass `schemes` or `initial`: the script knows only the `dark` class and the stored choice, so an app that sets the scheme itself leaves it out.
 *
 * An app whose light scheme has a class of its own passes `schemes` (`{ light: "my-light", dark: "dark" }`);
 * the toggle swaps those classes, and `schemeClass` gives the same one for the server to render on `<html>`.
 * An app that knows the scheme on the server (from a cookie) passes it as `initial`, so the server
 * markup, the hydrating client and the `<html>` class agree; persist a change from `onChange`.
 * The icon and the button's accessible name follow the class on `<html>` through CSS (the name is
 * two visually hidden "Switch to …" spans, one hidden by `display:none`), so even without `initial`
 * a dark page shows the sun and is named "Switch to light theme" from the first frame, with no
 * script. Only the tooltip catches up once the client has hydrated.
 * `store={false}` skips `localStorage`, for an app that keeps the choice in a server cookie and
 * writes it from `onChange`. Every other button prop (`id`, `data-*`, `aria-*`) goes on the button.
 */
export function ColourSchemeToggle({
  onChange,
  schemes = { light: "", dark: "dark" },
  initial,
  store = true,
  size = "md",
  ...rest
}: {
  /**
   * The button's height, as an `IconButton`'s.
   * @default md
   */
  size?: Size | undefined;
  /** Called with the new scheme after a click, for an app that persists the choice itself (a cookie). */
  onChange?: (scheme: ColourScheme) => void;
  /** The class each scheme puts on `<html>`. */
  schemes?: ColourSchemeClasses | undefined;
  /**
   * The scheme the server rendered. What the server and the hydrating client show; the real state follows right after.
   * @default light
   */
  initial?: ColourScheme | undefined;
  /** Remember the choice in `localStorage`. `false` leaves persisting to `onChange`. */
  store?: boolean | undefined;
} & Unstyled<
  Omit<
    ComponentPropsWithoutRef<"button">,
    "onChange" | "onClick" | "children" | "aria-label" | "title"
  >
>): ReactElement {
  const scheme = useSyncExternalStore(
    subscribe,
    () => appliedColourScheme(document.documentElement, schemes),
    () => initial ?? "light",
  );
  const hydrated = useSyncExternalStore(
    never,
    () => true,
    () => false,
  );
  const next: ColourScheme = scheme === "dark" ? "light" : "dark";
  return (
    <button
      type="button"
      {...rest}
      title={hydrated ? `Switch to ${next} theme` : undefined}
      className={look({ size })}
      onClick={() => {
        applyColourScheme(next, document.documentElement, schemes);
        if (store) storeColourScheme(next);
        onChange?.(next);
      }}
    >
      <style>{schemeRules(schemes)}</style>
      {sun}
      {moon}
      <span className="sr-only" data-scheme-name="dark">
        Switch to dark theme
      </span>
      <span className="sr-only" data-scheme-name="light">
        Switch to light theme
      </span>
    </button>
  );
}
