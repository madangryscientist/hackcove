// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { Divider } from "./Divider.js";
import { render, screen } from "./render.harness.js";

describe("Divider", () => {
  it("is a separator", () => {
    render(<Divider />);
    expect(screen.getByRole("separator").tagName).toBe("HR");
  });
});
