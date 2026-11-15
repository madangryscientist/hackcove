// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { Kbd } from "./Kbd.js";
import { render, screen } from "./render.harness.js";

describe("Kbd", () => {
  it("is a kbd element holding the key", () => {
    render(<Kbd>Esc</Kbd>);
    expect(screen.getByText("Esc").tagName).toBe("KBD");
  });

  it("is read by assistive tech unless the caller hides it", () => {
    render(<Kbd>k</Kbd>);
    expect(screen.getByText("k").hasAttribute("aria-hidden")).toBe(false);
  });
});
