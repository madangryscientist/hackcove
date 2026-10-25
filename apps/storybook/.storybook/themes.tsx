import type { ReactNode } from "react";
import { THEMES, themeNames, themeScope } from "@hackcove/themes-shared";

export { THEMES, themeNames };

/**
 * Each theme remaps under its own scope class. A theme is required: there is no unthemed frame.
 * `bare` drops the frame's padding, for a story that is a whole page (the Layout stories).
 */
export function ThemeFrame({
  theme,
  bare = false,
  children,
}: {
  theme: string;
  bare?: boolean;
  children: ReactNode;
}) {
  const css = THEMES[theme];
  return (
    <div className={css === undefined ? undefined : themeScope(css)} data-theme={theme}>
      {css !== undefined && <style dangerouslySetInnerHTML={{ __html: css }} />}
      <div className={bare ? undefined : "p-8"}>{children}</div>
    </div>
  );
}
