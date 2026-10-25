import { Select } from "@hackcove/ui";
import { NONE } from "@hackcove/themes-shared/none";
import { themes } from "../content/themes";

/**
 * The docs' theme picker: `default` and one option per `themes/*` folder. The server renders it with
 * the site's own theme selected; the script from `themeScript` (the site's one piece of JS) applies a
 * choice by swapping the scope class on `<html>` and remembers it.
 */
export function ThemePicker({ selected }: { selected: string }) {
  return (
    <Select aria-label="Theme" data-theme-picker size="sm" width="auto" defaultValue={selected}>
      <option value={NONE}>Default</option>
      {themes.map((theme) => (
        <option key={theme.folder} value={theme.folder}>
          {theme.title}
        </option>
      ))}
    </Select>
  );
}
