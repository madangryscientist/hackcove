import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { HERO_DRIFT, Hero } from "./Hero.js";
import { Lead } from "./typography.js";

const markup = (): string =>
  renderToStaticMarkup(
    <Hero overline="Products" title="Software we make.">
      <Lead>The lede.</Lead>
    </Hero>,
  );

describe("Hero", () => {
  it("renders the overline and the title as the page's h1 in a header, then the children", () => {
    const out = markup();
    expect(out).toMatch(/<header>.*Products.*<h1[^>]*>Software we make\.<\/h1><\/header>/);
    expect(out.indexOf("</header>")).toBeLessThan(out.indexOf("The lede."));
  });

  it("leaves the overline out when none is given", () => {
    const out = renderToStaticMarkup(<Hero title="Title" />);
    expect(out).not.toMatch(/font-mono/);
    expect(out).toContain("<h1");
  });

  it("hides the glow from assistive technology and the pointer, behind the text", () => {
    const out = markup();
    expect(out).toMatch(
      /<div aria-hidden="true" data-hero-glow="" class="pointer-events-none [^"]*-z-10/,
    );
    expect(out.match(/<span class="[^"]*bg-(?:indigo|teal|rose)-400\/25/g)).toHaveLength(3);
  });

  it("clips the glow to the text column, so it can never widen the page", () => {
    expect(markup()).toMatch(/data-hero-glow="" class="[^"]*\boverflow-hidden\b/);
    expect(markup()).toMatch(/data-hero="" class="[^"]*\bmax-w-3xl\b/);
  });

  it("drifts only under prefers-reduced-motion: no-preference", () => {
    const css = /<style>(.*?)<\/style>/s.exec(markup())?.[1] ?? "";
    const motion = /@media \(prefers-reduced-motion:no-preference\)\{(.*)\}\n@keyframes/s.exec(
      css,
    )?.[1];
    expect(motion).toContain(`animation:${HERO_DRIFT} `);
    expect(css.replace(/@media \(prefers-reduced-motion:no-preference\)\{.*\}\n/s, "")).not.toMatch(
      /animation/,
    );
    expect(css).toContain(`@keyframes ${HERO_DRIFT}{`);
  });

  it("carries no colour in its stylesheet: the theme paints the ribbons", () => {
    const css = /<style>(.*?)<\/style>/s.exec(markup())?.[1] ?? "";
    expect(css).not.toMatch(/#[0-9a-f]{3}|rgb|hsl|oklch|background|color/i);
  });
});
