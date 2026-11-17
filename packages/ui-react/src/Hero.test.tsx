// @vitest-environment jsdom
import { renderToStaticMarkup } from "react-dom/server"; // markup read as data, below
import { describe, expect, it } from "vitest";
import { Hero } from "./Hero.js";
import { follows, render, screen, within } from "./render.harness.js";
import { Lead } from "./typography.js";

const hero = (
  <Hero overline="Products" title="Software we make.">
    <Lead>The lede.</Lead>
  </Hero>
);

describe("Hero", () => {
  it("is the page's h1 in a header, after the overline, with the children after the header", () => {
    render(hero);
    const title = screen.getByRole("heading", { level: 1, name: "Software we make." });
    const header = screen.getByRole("banner");
    expect(within(header).getByText("Products")).not.toBeNull();
    expect(follows(screen.getByText("Products"), title)).toBeTruthy();
    expect(within(header).queryByText("The lede.")).toBeNull();
    expect(follows(header, screen.getByText("The lede."))).toBeTruthy();
  });

  it("leaves the overline out when none is given", () => {
    render(<Hero title="Title" />);
    expect(screen.getByRole("banner").textContent).toBe("Title");
  });

  it("keeps an overline of 0, which is a label and not nothing", () => {
    render(<Hero overline={0} title="Title" />);
    expect(within(screen.getByRole("banner")).getByText("0")).not.toBeNull();
  });
});

// The markup is read as data here (the glow's attributes, the stylesheet's text), not searched for
// a look, so a server render is the right tool, as noLeak.test.tsx does.
const markup = (): string => renderToStaticMarkup(hero); // markup read as data
const stylesheet = (): string => /<style>(.*?)<\/style>/s.exec(markup())?.[1] ?? "";

describe("Hero markup, read as data", () => {
  it("hides the glow from assistive technology", () => {
    expect(markup()).toMatch(/<div aria-hidden="true" data-hero-glow=""/);
  });

  it("paints nothing in its stylesheet: the mask only sets how much shows, the theme paints the ribbons", () => {
    expect(stylesheet()).not.toMatch(
      /#[0-9a-f]{3}|rgba?\(|hsla?\(|oklch\(|(?:^|[;{])(?:background|color)[\w-]*:/i,
    );
  });

  it("writes its stylesheet with no character a server renderer may escape", () => {
    expect(stylesheet()).not.toMatch(/[<>&"']/);
  });
});
