// @vitest-environment jsdom
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import { Card } from "./Card.js";
import { IconButton } from "./IconButton.js";
import { Pill } from "./Pill.js";
import { render, screen, user } from "./render.harness.js";

// `href` makes the whole part the link: Card, IconButton and Pill. Pill also has a button form.

describe("Card href", () => {
  it("is one link to its href, named by the card's text, and no region", () => {
    render(
      <Card href="/shots/1" title="Shot" count={3}>
        body
      </Card>,
    );
    expect(screen.getAllByRole("link")).toHaveLength(1);
    expect(screen.getByRole("link", { name: /Shot.*body/ }).getAttribute("href")).toBe("/shots/1");
    expect(screen.getByRole("heading", { level: 2, name: /Shot/ })).not.toBeNull();
    expect(screen.queryByRole("region")).toBeNull();
  });

  it("opens a new tab when external", () => {
    render(
      <Card href="https://example.com" external title="Out">
        body
      </Card>,
    );
    const link = screen.getByRole("link", { name: /Out/ });
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noreferrer");
  });

  it("takes no actions or as with href", () => {
    // @ts-expect-error a card that is a link has no actions
    const withActions: ComponentProps<typeof Card> = {
      href: "/x",
      actions: "a",
      children: "b",
    };
    const withAs: ComponentProps<typeof Card> = {
      href: "/x",
      // @ts-expect-error a card that is a link is not an `as` element
      as: "article",
      children: "b",
    };
    expect([withActions, withAs]).toHaveLength(2);
  });
});

describe("IconButton href", () => {
  it("is a link to its href named and titled by its label, not a button", () => {
    render(<IconButton href="/settings" label="Settings" variant="ghost" icon="close" />);
    const link = screen.getByRole("link", { name: "Settings" });
    expect(link.getAttribute("href")).toBe("/settings");
    expect(link.getAttribute("title")).toBe("Settings");
    expect(link.hasAttribute("type")).toBe(false);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it.each([
    ["a link", { href: "/alerts" }, "link"],
    ["a button", {}, "button"],
  ] as const)("names and titles a count on %s, and shows it", (_form, extra, role) => {
    render(<IconButton {...extra} label="Alerts" count={3} icon="close" />);
    const control = screen.getByRole(role, { name: "Alerts, 3" });
    expect(control.getAttribute("title")).toBe("Alerts, 3");
    expect(screen.getByText("3")).not.toBeNull();
  });

  it("shows no count at 0", () => {
    render(<IconButton label="Alerts" count={0} icon="close" />);
    expect(screen.getByRole("button", { name: "Alerts" })).not.toBeNull();
    expect(screen.queryByText("0")).toBeNull();
  });

  it("caps the shown count above 99, and names the real one", () => {
    render(<IconButton label="Alerts" count={120} icon="close" />);
    expect(screen.getByRole("button", { name: "Alerts, 120" })).not.toBeNull();
    expect(screen.getByText("99+")).not.toBeNull();
  });
});

describe("Pill href and onClick", () => {
  it("a plain Pill is text, neither a link nor a button", () => {
    render(<Pill>x</Pill>);
    expect(screen.getByText("x")).not.toBeNull();
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("href makes it a link to its href, named by its text", () => {
    render(
      <Pill href="/flakes" tone="warn" round>
        flaky
      </Pill>,
    );
    expect(screen.getByRole("link", { name: "flaky" }).getAttribute("href")).toBe("/flakes");
  });

  it("onClick makes it a type=button button that calls it on a click", async () => {
    const onClick = vi.fn<() => void>();
    render(
      <Pill onClick={onClick} dot>
        filter
      </Pill>,
    );
    const button = screen.getByRole("button", { name: "filter" });
    expect(button.getAttribute("type")).toBe("button");
    await user().click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("is a link or a button, never both", () => {
    // @ts-expect-error href and onClick are two forms
    const both: ComponentProps<typeof Pill> = {
      href: "/x",
      onClick: () => undefined,
      children: "x",
    };
    expect(both).toBeDefined();
  });
});
