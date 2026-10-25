import { Select } from "@hackcove/ui";
import { useSyncExternalStore } from "react";
import { THEME_KEY } from "../content/themeKey.js";

const onClassChange = (notify: () => void) => {
  const observer = new MutationObserver(notify);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
};

/**
 * The header's theme picker, the site's one island: a compact Select with one option per `themes/*`
 * folder (it fits beside the brand on a phone, where a segmented control would not). The scope class on `<html>` is the state: the server renders the site's own theme
 * (`selected`), the pre-paint script may already have swapped it, and a choice swaps it and is
 * remembered. `scopes` maps each folder to its scope class, passed in so no theme CSS ships here.
 */
export function ThemePicker({
  items,
  scopes,
  selected,
}: {
  items: { value: string; label: string }[];
  scopes: Record<string, string>;
  selected: string;
}) {
  const value = useSyncExternalStore(
    onClassChange,
    () =>
      Object.keys(scopes).find((folder) =>
        document.documentElement.classList.contains(scopes[folder] ?? ""),
      ) ?? selected,
    () => selected,
  );

  const choose = (folder: string) => {
    const root = document.documentElement;
    for (const scope of Object.values(scopes)) root.classList.remove(scope);
    root.classList.add(scopes[folder] ?? "");
    try {
      localStorage.setItem(THEME_KEY, folder);
    } catch {
      // Private mode: the choice applies to this page and is not remembered.
    }
  };

  return (
    <Select
      aria-label="Theme"
      size="sm"
      width="auto"
      value={value}
      onChange={(event) => choose(event.target.value)}
    >
      {items.map((item) => (
        <option key={item.value} value={item.value}>
          {item.label}
        </option>
      ))}
    </Select>
  );
}
