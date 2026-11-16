// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { AppShell } from "./AppShell.js";
import { render, screen } from "./render.harness.js";
import { SiteFooter } from "./SiteFooter.js";

describe("SiteFooter", () => {
  it("links the brand home by default, named by brandLabel", () => {
    render(<SiteFooter brand={<b>PS</b>} brandLabel="PixelSlash home" />);
    expect(screen.getByRole("link", { name: "PixelSlash home" }).getAttribute("href")).toBe("/");
  });

  it("links the brand to brandHref", () => {
    render(<SiteFooter brand="PixelSlash" brandHref="/pixelslash/" />);
    expect(screen.getByRole("link", { name: "PixelSlash" }).getAttribute("href")).toBe(
      "/pixelslash/",
    );
  });

  it("has no brand link without a brand", () => {
    render(<SiteFooter>Email hello@example.com</SiteFooter>);
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.getByText("Email hello@example.com")).not.toBeNull();
  });

  it("draws each link with its label and href; external opens a new tab", () => {
    render(
      <SiteFooter
        links={[
          { label: "Privacy", href: "/privacy" },
          { label: "GitHub", href: "https://github.com/x", external: true },
        ]}
      />,
    );
    expect(screen.getByRole("link", { name: "Privacy" }).getAttribute("href")).toBe("/privacy");
    const github = screen.getByRole("link", { name: /GitHub/ });
    expect(github.getAttribute("href")).toBe("https://github.com/x");
    expect(github.getAttribute("target")).toBe("_blank");
  });

  it("sets each note in its own paragraph", () => {
    render(<SiteFooter notes={["MIT licence", "Made in Cape Town"]} />);
    expect(screen.getByText("MIT licence").tagName).toBe("P");
    expect(screen.getByText("Made in Cape Town").tagName).toBe("P");
  });

  it("draws no contentinfo of its own: in AppShell's footer the page has one", () => {
    render(
      <AppShell footer={<SiteFooter notes={["MIT licence"]} />}>
        <p>Page</p>
      </AppShell>,
    );
    expect(screen.getAllByRole("contentinfo")).toHaveLength(1);
  });
});
