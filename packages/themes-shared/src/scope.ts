/**
 * A theme's scope class is the class of the first top-level `.<class> {` rule in its theme.css
 * (`.dark` for Catppuccin Mocha). Reading it from the CSS keeps every theme name out of code.
 * Storybook's `?inline` import minifies the CSS onto one line, so a rule starts after `;` or `}`.
 */
export function themeScope(css: string): string | undefined {
  return /(?:^|[;}])\s*\.([\w-]+)\s*\{/.exec(css.replace(/\/\*[\s\S]*?\*\//g, ""))?.[1];
}

/**
 * A dark theme declares `@custom-variant dark` in its theme.css (a light theme declares none), so
 * the colour scheme of a theme is read from the CSS and never listed by name.
 */
export function declaresDark(css: string): boolean {
  return /@custom-variant\s+dark\b/.test(css.replace(/\/\*[\s\S]*?\*\//g, ""));
}
