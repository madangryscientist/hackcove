// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { Button } from "./Button.js";
import { render, screen } from "./render.harness.js";

// A stand-in for a router's <Link>: it takes `to` and spreads the props it is handed.

describe("Button href", () => {
  it("is a link to its href, not a button", () => {
    render(<Button href="/new">New</Button>);
    expect(screen.getByRole("link", { name: "New" }).getAttribute("href")).toBe("/new");
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("passes anchor props through", () => {
    render(
      <Button href="/x" download="x.pdf">
        X
      </Button>,
    );
    expect(screen.getByRole("link", { name: "X" }).getAttribute("download")).toBe("x.pdf");
  });

  it("external opens in a new tab", () => {
    render(
      <Button href="https://example.com" external>
        X
      </Button>,
    );
    const link = screen.getByRole("link", { name: "X" });
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noreferrer");
  });

  it("an internal link opens in the same tab", () => {
    render(<Button href="/x">X</Button>);
    expect(screen.getByRole("link", { name: "X" }).hasAttribute("target")).toBe(false);
  });
});
