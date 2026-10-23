import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { linkClass, TextLink } from "./TextLink.js";

describe("TextLink", () => {
  it("renders an anchor with the href, the children and the link classes", () => {
    const out = renderToStaticMarkup(<TextLink href="/about">About</TextLink>);
    expect(out.startsWith("<a")).toBe(true);
    expect(out).toContain('href="/about"');
    expect(out).toContain(">About</a>");
    expect(out).toContain(`class="${linkClass}"`);
  });

  it("is the accent colour with a hover shade, medium weight and a focus ring", () => {
    expect(linkClass).toContain("text-violet-600");
    expect(linkClass).toContain("hover:text-violet-700");
    expect(linkClass).toContain("font-medium");
    expect(linkClass).toContain("underline-offset-2");
    expect(linkClass).toContain("focus-visible:outline-violet-600");
  });

  it("opens in a new tab only when external", () => {
    const plain = renderToStaticMarkup(<TextLink href="/a">a</TextLink>);
    expect(plain).not.toContain("target");
    expect(plain).not.toContain("rel=");
    const ext = renderToStaticMarkup(
      <TextLink href="https://example.com" external>
        a
      </TextLink>,
    );
    expect(ext).toContain('target="_blank"');
    expect(ext).toContain('rel="noreferrer"');
  });

  it("appends className and passes other anchor props through", () => {
    const out = renderToStaticMarkup(
      <TextLink href="/cv.pdf" className="text-sm" download="cv.pdf">
        PDF
      </TextLink>,
    );
    expect(out).toContain(`class="${linkClass} text-sm"`);
    expect(out).toContain('download="cv.pdf"');
  });
});
