export type ColourScheme = "light" | "dark";

const STORAGE_KEY = "hackcove:colour-scheme";
const DARK_QUERY = "(prefers-color-scheme: dark)";

const isScheme = (value: unknown): value is ColourScheme => value === "light" || value === "dark";

/** Put `scheme` on `root` (the `<html>` element by default): the `dark` class, and `color-scheme` so native controls and scrollbars follow. */
export function applyColourScheme(
  scheme: ColourScheme,
  root: HTMLElement = document.documentElement,
): void {
  root.classList.toggle("dark", scheme === "dark");
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
