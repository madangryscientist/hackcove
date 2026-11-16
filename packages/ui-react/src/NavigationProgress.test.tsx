// @vitest-environment jsdom
import { renderToStaticMarkup } from "react-dom/server"; // markup read as data, below
import { describe, expect, it } from "vitest";
import { NavigationProgress } from "./NavigationProgress.js";
import { render, screen } from "./render.harness.js";

describe("NavigationProgress", () => {
  it("draws nothing while `loading` is false", () => {
    render(<NavigationProgress loading={false} />);
    expect(screen.queryByRole("progressbar")).toBeNull();
  });

  it("is an indeterminate progressbar named 'Loading page' while loading", () => {
    render(<NavigationProgress loading />);
    const bar = screen.getByRole("progressbar", { name: "Loading page" });
    expect(bar.hasAttribute("aria-valuenow")).toBe(false);
  });

  it("takes another name", () => {
    render(<NavigationProgress loading label="Opening store" />);
    expect(screen.getByRole("progressbar", { name: "Opening store" })).not.toBeNull();
  });

  it("puts no colour in its stylesheet", () => {
    // The <style> beside the bar has no role to find it by, so it is read as data.
    const out = renderToStaticMarkup(<NavigationProgress loading />); // markup read as data
    const css = /<style>(.*?)<\/style>/s.exec(out)?.[1];
    expect(css).toContain("@keyframes hc-navigation-progress{");
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b|rgb|hsl|oklch|violet/i);
  });
});
