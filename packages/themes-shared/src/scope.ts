/**
 * A theme's scope class is the class of the first top-level `.<class> {` rule in its theme.css
 * (`.dark` for Catppuccin Mocha). Reading it from the CSS keeps every theme name out of code.
 * Storybook's `?inline` import minifies the CSS onto one line, so a rule starts after `;` or `}`.
 */
export function themeScope(css: string): string | undefined {
  return /(?:^|[;}])\s*\.([\w-]+)\s*\{/.exec(css.replace(/\/\*[\s\S]*?\*\//g, ""))?.[1];
}
