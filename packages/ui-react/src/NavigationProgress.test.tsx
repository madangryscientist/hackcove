import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { NavigationProgress } from "./NavigationProgress.js";

const html = (node: Parameters<typeof renderToStaticMarkup>[0]) => renderToStaticMarkup(node);

describe("NavigationProgress", () => {
  it("draws exactly what `active` says", () => {
    expect(html(<NavigationProgress active={false} />)).toBe("");
    expect(html(<NavigationProgress active />)).toContain('role="progressbar"');
  });

  it("is an indeterminate progressbar named 'Loading page', and takes another name", () => {
    const out = html(<NavigationProgress active />);
    expect(out).toContain('aria-label="Loading page"');
    expect(out).not.toContain("aria-valuenow");
    expect(html(<NavigationProgress active label="Opening store" />)).toContain(
      'aria-label="Opening store"',
    );
  });

  it("is the accent fill, and its stylesheet holds the 150ms wait and carries no colour", () => {
    const out = html(<NavigationProgress active />);
    expect(out).toContain("bg-violet-600");
    const css = /<style>(.*?)<\/style>/s.exec(out)?.[1] ?? "";
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b|rgb|hsl|oklch|violet/i);
    expect(css).toMatch(/\[data-navigation-progress\]\{animation:[^}]*150ms backwards/);
    expect(css).toContain("@keyframes hc-navigation-progress{");
    expect(css).toMatch(/@media \(prefers-reduced-motion:reduce\)\{[^@]*animation:none/);
  });
});
