// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "./render.harness.js";
import { TextLink } from "./TextLink.js";

const link = (name: string) => screen.getByRole("link", { name });

describe("TextLink", () => {
  it("is a link named by its children, to its href", () => {
    render(<TextLink href="/about">About</TextLink>);
    expect(link("About").getAttribute("href")).toBe("/about");
  });

  it("opens in the same tab unless external", () => {
    render(<TextLink href="/a">Plain</TextLink>);
    expect(link("Plain").hasAttribute("target")).toBe(false);
    expect(link("Plain").hasAttribute("rel")).toBe(false);
  });

  it("opens an external link in a new tab, with no referrer", () => {
    render(
      <TextLink href="https://example.com" external>
        Out
      </TextLink>,
    );
    expect(link("Out").getAttribute("target")).toBe("_blank");
    expect(link("Out").getAttribute("rel")).toBe("noreferrer");
  });

  it("lets the caller's rel win on an external link", () => {
    render(
      <TextLink href="https://example.com" external rel="noopener">
        Out
      </TextLink>,
    );
    expect(link("Out").getAttribute("rel")).toBe("noopener");
  });

  it("passes other anchor props through", () => {
    render(
      <TextLink href="/cv.pdf" download="cv.pdf">
        PDF
      </TextLink>,
    );
    expect(link("PDF").getAttribute("download")).toBe("cv.pdf");
  });
});
