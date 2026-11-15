import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { linkClass, linkStretchClass, TextLink } from "./TextLink.js";
import { TEXT_TONE } from "./typography.js";

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
    const own = renderToStaticMarkup(
      <TextLink href="https://example.com" external rel="noopener">
        a
      </TextLink>,
    );
    expect(own).toContain('rel="noopener"');
    expect(own).not.toContain("noreferrer");
  });

  it("passes other anchor props through", () => {
    const out = renderToStaticMarkup(
      <TextLink href="/cv.pdf" download="cv.pdf">
        PDF
      </TextLink>,
    );
    expect(out).toContain(`class="${linkClass}"`);
    expect(out).toContain('download="cv.pdf"');
  });
});

// A stand-in for a router's <Link>: it takes `to` and spreads the props it is handed.

describe("TextLink stretch", () => {
  it("covers the nearest relative ancestor with the link's ::after", () => {
    expect(linkStretchClass).toBe("link-stretch after:absolute after:inset-0");
    const out = renderToStaticMarkup(
      <TextLink href="/q/1" stretch>
        Quote 1
      </TextLink>,
    );
    expect(out).toContain(`class="${linkClass} ${linkStretchClass}"`);
  });

  it("is off by default", () => {
    expect(renderToStaticMarkup(<TextLink href="/a">a</TextLink>)).not.toContain("after:");
  });
});

describe("TextLink size and mono", () => {
  it("takes the surrounding size unless `size` pins one", () => {
    const plain = renderToStaticMarkup(<TextLink href="/a">a</TextLink>);
    expect(plain).not.toMatch(/text-(xs|sm|base)/);
    expect(plain).not.toContain("font-mono");
    for (const [size, cls] of [
      ["sm", "text-xs/4"],
      ["md", "text-sm/5"],
      ["lg", "text-base/6"],
    ] as const) {
      const out = renderToStaticMarkup(
        <TextLink href="/a" size={size}>
          a
        </TextLink>,
      );
      expect(out).toContain(cls);
      expect(out).toContain(linkClass);
      expect(out).not.toContain("size=");
    }
  });

  it("`mono` sets the monospace face and is not forwarded", () => {
    const out = renderToStaticMarkup(
      <TextLink href="/a" mono size="sm">
        src/a.ts
      </TextLink>,
    );
    expect(out).toContain("font-mono");
    expect(out).not.toContain("mono=");
  });
});

describe("TextLink tone", () => {
  it("is the accent colour until a tone is given", () => {
    const out = renderToStaticMarkup(<TextLink href="/a">a</TextLink>);
    expect(out).toContain("text-violet-600");
    expect(out).not.toContain("hover:underline");
  });

  it("takes the colour of TEXT_TONE and underlines on hover, in place of the accent", () => {
    for (const tone of ["muted", "info", "positive", "warn", "danger"] as const) {
      const out = renderToStaticMarkup(
        <TextLink href="/a" tone={tone}>
          a
        </TextLink>,
      );
      expect(out).toContain(TEXT_TONE[tone]);
      expect(out).toContain("hover:underline");
      expect(out).toContain("font-medium");
      expect(out).toContain("focus-visible:outline-violet-600");
      expect(out).not.toContain("text-violet-600");
      expect(out).not.toContain("hover:text-violet-700");
      expect(out).not.toContain("tone=");
    }
  });
});
