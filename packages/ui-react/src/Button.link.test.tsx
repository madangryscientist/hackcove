// @vitest-environment jsdom
import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";
import { Button } from "./Button.js";
import type { LinkRenderProps } from "./link.js";
import { render, screen } from "./render.harness.js";

// A stand-in for a router's <Link>: it takes `to` and spreads the props it is handed.
const Link = ({ to, ...rest }: { to: string } & LinkRenderProps): ReactElement => (
  <a data-router-link="" data-to={to} {...rest} />
);

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

  it("render draws the app's own Link, named by the label, with no href of its own", () => {
    render(
      <Button variant="ghost" render={(p) => <Link to="/quotes" {...p} />}>
        Back
      </Button>,
    );
    // An <a> with no href has no link role; the router's Link supplies it in the app.
    const link = screen.getByText("Back");
    expect(link.getAttribute("data-to")).toBe("/quotes");
    expect(link.hasAttribute("href")).toBe(false);
  });

  it("render with external hands target and rel to the Link", () => {
    render(
      <Button external render={(p) => <Link to="/x" {...p} />}>
        X
      </Button>,
    );
    expect(screen.getByText("X").getAttribute("target")).toBe("_blank");
  });
});
