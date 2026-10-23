import { useSyncExternalStore, type ReactElement } from "react";
import { applyColourScheme, storeColourScheme, type ColourScheme } from "./colourScheme.js";
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

// The `dark` class on <html> is the source of truth: the head script set it before React ran.
function subscribe(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

const current = (): ColourScheme =>
  document.documentElement.classList.contains("dark") ? "dark" : "light";

// What the server and the hydrating client both render; the real state follows right after.
const server = (): ColourScheme => "light";

/** A sun/moon button that switches `<html>` between light and dark and remembers the choice. It shows the scheme you would switch to. Pair it with `colourSchemeScript` in `<head>`. */
export function ColourSchemeToggle({
  className,
  onChange,
}: {
  className?: string;
  onChange?: (scheme: ColourScheme) => void;
}): ReactElement {
  const scheme = useSyncExternalStore(subscribe, current, server);
  const next: ColourScheme = scheme === "dark" ? "light" : "dark";
  return (
    <IconButton
      label={`Switch to ${next} theme`}
      className={className}
      onClick={() => {
        applyColourScheme(next);
        storeColourScheme(next);
        onChange?.(next);
      }}
    >
      {next === "light" ? sun : moon}
    </IconButton>
  );
}
