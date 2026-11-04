import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Code } from "./Code.js";
import { MetaList } from "./MetaList.js";
import { TextLink } from "./TextLink.js";

describe("MetaList", () => {
  it("is a wrapping list of muted small text, one item per fact", () => {
    const out = renderToStaticMarkup(
      <MetaList>
        <span>main</span>
        <Code>0f9d376</Code>
        <span>26 Oct</span>
      </MetaList>,
    );
    expect(out).toContain("<ul");
    expect(out).toContain("flex flex-wrap items-center");
    expect(out).toContain("text-sm text-slate-500");
    expect(out.match(/<li/g)).toHaveLength(3);
    expect(out.match(/<ul class="[^"]*"/)?.[0]).not.toContain("font-mono");
  });

  it("puts an aria-hidden dot between items, not before the first or after the last", () => {
    const out = renderToStaticMarkup(
      <MetaList>
        <span>a</span>
        <span>b</span>
        <span>c</span>
      </MetaList>,
    );
    expect(out.match(/aria-hidden="true"[^>]*>·</g)).toHaveLength(2);
    expect(out.indexOf("·")).toBeGreaterThan(out.indexOf(">a<"));
    expect(out.lastIndexOf("·")).toBeLessThan(out.indexOf(">c<"));
  });

  it("takes text, Code and TextLink items", () => {
    const out = renderToStaticMarkup(
      <MetaList>
        plain text
        <Code>abc123</Code>
        <TextLink href="/b/main">main</TextLink>
      </MetaList>,
    );
    expect(out).toContain("plain text");
    expect(out).toContain("<code");
    expect(out).toContain('href="/b/main"');
  });

  it("mono sets the monospace face on the row", () => {
    const out = renderToStaticMarkup(
      <MetaList mono>
        <span>a</span>
        <span>b</span>
      </MetaList>,
    );
    expect(out.match(/<ul class="[^"]*"/)?.[0]).toContain("font-mono");
  });

  it("renders a single item bare", () => {
    const one = renderToStaticMarkup(
      <MetaList>
        <span>only</span>
      </MetaList>,
    );
    expect(one).not.toContain("aria-hidden");
  });
});

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

describe("MetaList separator and nowrap", () => {
  it("takes a bullet, or none", () => {
    const bullet = renderToStaticMarkup(<MetaList separator="•">{links}</MetaList>);
    expect(bullet.match(/•/g)).toHaveLength(2);
    expect(bullet).not.toContain("·");
    const none = renderToStaticMarkup(<MetaList separator="none">{links}</MetaList>);
    expect(none).not.toContain("aria-hidden");
  });

  it("keeps each item on one line with nowrap, and wraps inside one without", () => {
    expect(
      renderToStaticMarkup(<MetaList nowrap>{links}</MetaList>).match(/whitespace-nowrap/g),
    ).toHaveLength(3);
    expect(renderToStaticMarkup(<MetaList>{links}</MetaList>)).not.toContain("whitespace-nowrap");
  });
});
