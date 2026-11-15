// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { IconButton } from "./IconButton.js";
import { render, screen } from "./render.harness.js";

describe("IconButton", () => {
  it("is a button named and titled by its label", () => {
    render(<IconButton label="Switch to dark theme">x</IconButton>);
    const button = screen.getByRole("button", { name: "Switch to dark theme" });
    expect(button.getAttribute("title")).toBe("Switch to dark theme");
  });

  it("is type button by default", () => {
    render(<IconButton label="a">x</IconButton>);
    expect(screen.getByRole("button", { name: "a" }).getAttribute("type")).toBe("button");
  });

  it("takes the caller's type", () => {
    render(
      <IconButton label="a" type="submit">
        x
      </IconButton>,
    );
    expect(screen.getByRole("button", { name: "a" }).getAttribute("type")).toBe("submit");
  });
});
