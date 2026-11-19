// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { Code } from "./Code.js";
import { MetaList } from "./MetaList.js";
import { render, screen, within } from "./render.harness.js";
import { TextLink } from "./TextLink.js";

describe("MetaList", () => {
  it("is a list, one item per fact", () => {
    render(
      <MetaList>
        <span>main</span>
        <Code>0f9d376</Code>
        <span>26 Oct</span>
      </MetaList>,
    );
    expect(within(screen.getByRole("list")).getAllByRole("listitem")).toHaveLength(3);
  });

  it("trails every item but the last with a dot hidden from assistive tech", () => {
    render(
      <MetaList>
        <span>a</span>
        <span>b</span>
        <span>c</span>
      </MetaList>,
    );
    const dots = screen.getAllByRole("listitem").map((item) =>
      within(item)
        .queryAllByText("·")
        .map((dot) => dot.getAttribute("aria-hidden")),
    );
    expect(dots).toEqual([["true"], ["true"], []]);
  });

  it("takes text, Code and TextLink items", () => {
    render(
      <MetaList>
        plain text
        <Code>abc123</Code>
        <TextLink href="/b/main">main</TextLink>
      </MetaList>,
    );
    expect(screen.getByText("plain text")).not.toBeNull();
    expect(screen.getByRole("code").textContent).toBe("abc123");
    expect(screen.getByRole("link", { name: "main" }).getAttribute("href")).toBe("/b/main");
  });

  it("puts no dot by a single item", () => {
    render(
      <MetaList>
        <span>only</span>
      </MetaList>,
    );
    expect(screen.queryByText("·")).toBeNull();
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

describe("MetaList separator", () => {
  it("sits in the same item as the link before it, so no item starts with one", () => {
    render(<MetaList separator="•">{links}</MetaList>);
    const items = screen.getAllByRole("listitem");
    expect(items.map((item) => item.textContent)).toEqual(["Privacy•", "Terms•", "Email"]);
    expect(items.filter((item) => item.textContent?.startsWith("•"))).toHaveLength(0);
  });

  it("takes a bullet in place of the dot", () => {
    render(<MetaList separator="•">{links}</MetaList>);
    expect(screen.getAllByText("•")).toHaveLength(2);
    expect(screen.queryByText("·")).toBeNull();
  });

  it("takes none, for a gap alone", () => {
    render(<MetaList separator="none">{links}</MetaList>);
    expect(screen.queryAllByText(/[·•]/)).toHaveLength(0);
    expect(screen.getAllByRole("link")).toHaveLength(3);
  });
});
