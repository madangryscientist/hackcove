import { useLayoutEffect, type ReactNode } from "react";
import { SCOPES, THEMES, themeNames, themeScope } from "@hackcove/themes-shared";

export { THEMES, themeNames };

/**
 * One panel in a theme: a block that paints the theme's page colour under its own scope class.
 * Only Overview / All themes uses it, to lay every theme out side by side. The toolbar's theme goes
 * on the document instead (`ThemeDocument`).
 * `bare` drops the panel's padding.
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

/** Put the theme's scope class (or none) on `<html>`, the way an app does, and nothing else. */
function setDocumentTheme(theme: string | undefined) {
  const root = document.documentElement;
  root.classList.remove(...Object.values(SCOPES));
  root.removeAttribute("data-theme");
  const scope = theme === undefined ? undefined : SCOPES[theme];
  if (theme === undefined || scope === undefined) return;
  root.classList.add(scope);
  root.setAttribute("data-theme", theme);
}

/**
 * The toolbar's theme, on the document: the scope class and `data-theme` go on `<html>`, so the
 * theme's page colour and text colour paint the canvas around the story and the story itself sits
 * in no painted wrapper. PixelSlash crops a story shot to its content, and a full-width painted
 * block under the story root would keep every crop as wide as the viewport.
 * `padded` is for a story that is a whole page (`layout: "fullscreen"`) and wants air around it; a
 * centered story gets none, because the crop adds its own.
 * Pass no `theme` for a story that lays out every theme itself: the document stays unthemed.
 */
export function ThemeDocument({
  theme,
  padded = false,
  children,
}: {
  theme?: string;
  padded?: boolean;
  children: ReactNode;
}) {
  const css = theme === undefined ? undefined : THEMES[theme];
  useLayoutEffect(() => setDocumentTheme(theme), [theme]);
  return (
    <>
      {css !== undefined && <style dangerouslySetInnerHTML={{ __html: css }} />}
      {padded ? <div className="p-8">{children}</div> : children}
    </>
  );
}
