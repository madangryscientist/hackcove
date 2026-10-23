import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { InlineLinks } from "./InlineLinks.js";
import { TextLink } from "./TextLink.js";

const links = [
  <TextLink key="p" href="/privacy">
    Privacy
  </TextLink>,
  <TextLink key="t" href="/terms">
    Terms
  </TextLink>,
  <TextLink key="e" href="mailto:a@b.c">
    Email
  </TextLink>,
];

describe("InlineLinks", () => {
  it("wraps its links in a wrapping flex row of small text", () => {
    const out = renderToStaticMarkup(<InlineLinks>{links}</InlineLinks>);
    expect(out).toContain("flex flex-wrap items-center");
    expect(out).toContain("text-sm");
    expect(out).toContain(">Privacy</a>");
    expect(out).toContain(">Terms</a>");
  });

  it("puts an aria-hidden dot between links, not before the first or after the last", () => {
    const out = renderToStaticMarkup(<InlineLinks>{links}</InlineLinks>);
    expect(out.match(/aria-hidden="true"[^>]*>·</g)).toHaveLength(2);
    expect(out.indexOf("·")).toBeGreaterThan(out.indexOf("Privacy"));
    expect(out.lastIndexOf("·")).toBeLessThan(out.indexOf("Email"));
  });

  it("takes a bullet, or none", () => {
    const bullet = renderToStaticMarkup(<InlineLinks separator="•">{links}</InlineLinks>);
    expect(bullet.match(/•/g)).toHaveLength(2);
    expect(bullet).not.toContain("·");
    const none = renderToStaticMarkup(<InlineLinks separator="none">{links}</InlineLinks>);
    expect(none).not.toContain("aria-hidden");
  });

  it("renders a single link bare, and appends className to the row", () => {
    const out = renderToStaticMarkup(
      <InlineLinks className="cv-screen-nav">{links.slice(0, 1)}</InlineLinks>,
    );
    expect(out).not.toContain("aria-hidden");
    expect(out).toContain("text-sm cv-screen-nav");
  });

  it("ignores empty children", () => {
    const out = renderToStaticMarkup(
      <InlineLinks>
        {links[0]}
        {false}
        {links[1]}
      </InlineLinks>,
    );
    expect(out.match(/·/g)).toHaveLength(1);
  });
});
