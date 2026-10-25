export type ColourScheme = "light" | "dark";

const STORAGE_KEY = "hackcove:colour-scheme";
const DARK_QUERY = "(prefers-color-scheme: dark)";

const isScheme = (value: unknown): value is ColourScheme => value === "light" || value === "dark";

/** The class each scheme puts on `<html>`: none for light and `dark` for dark, unless the app's theme says otherwise (a light theme with a scope class of its own). */
export type ColourSchemeClasses = { light: string; dark: string };

const DEFAULT_CLASSES: ColourSchemeClasses = { light: "", dark: "dark" };

/** The class for `scheme`: what to render on `<html>` on the server so the first paint is right. `""` for the default light scheme. */
export function schemeClass(
  scheme: ColourScheme,
  schemes: ColourSchemeClasses = DEFAULT_CLASSES,
): string {
  return schemes[scheme];
}

/** Which scheme `root` is in: dark when it carries the dark class, else light. */
export function appliedColourScheme(
  root: HTMLElement = document.documentElement,
  schemes: ColourSchemeClasses = DEFAULT_CLASSES,
): ColourScheme {
  return schemes.dark !== "" && root.classList.contains(schemes.dark) ? "dark" : "light";
}

/** Put `scheme` on `root` (the `<html>` element by default): its class from `schemes` (default `dark` for dark and none for light), the other scheme's class taken off, and `color-scheme` so native controls and scrollbars follow. */
export function applyColourScheme(
  scheme: ColourScheme,
  root: HTMLElement = document.documentElement,
  schemes: ColourSchemeClasses = DEFAULT_CLASSES,
): void {
  const other = scheme === "dark" ? "light" : "dark";
  if (schemes[other] !== "") root.classList.remove(schemes[other]);
  if (schemes[scheme] !== "") root.classList.add(schemes[scheme]);
  root.style.colorScheme = scheme;
}

function storedScheme(): ColourScheme | undefined {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return isScheme(stored) ? stored : undefined;
  } catch {
    return undefined; // storage blocked: private mode, or no window at all
  }
}

function systemScheme(): ColourScheme | undefined {
  if (typeof matchMedia !== "function") return undefined;
  return matchMedia(DARK_QUERY).matches ? "dark" : "light";
}

/** The stored choice, else the system preference. `fallback` (default `"light"`) is for when neither is available: server rendering, or storage that throws with no `matchMedia`. */
export function readColourScheme(fallback: ColourScheme = "light"): ColourScheme {
  return storedScheme() ?? systemScheme() ?? fallback;
}

/** Remember `scheme` for the next visit. A storage error is swallowed, so private mode does not crash. */
export function storeColourScheme(scheme: ColourScheme): void {
  try {
    localStorage.setItem(STORAGE_KEY, scheme);
  } catch {
    // Not remembered; the page still switches for this visit.
  }
}

/**
 * JavaScript to inline in `<head>`, before first paint: applies the stored scheme, else the
 * system one, to `<html>` as `applyColourScheme` does. Without it a light user sees a dark flash.
 */
export const colourSchemeScript = `(function(){var r=document.documentElement,s;try{s=localStorage.getItem(${JSON.stringify(STORAGE_KEY)})}catch(e){}if(s!=="light"&&s!=="dark")s=typeof matchMedia==="function"?matchMedia(${JSON.stringify(DARK_QUERY)}).matches?"dark":"light":null;if(s){r.classList.toggle("dark",s==="dark");r.style.colorScheme=s}})()`;
