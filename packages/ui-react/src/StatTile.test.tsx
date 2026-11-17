// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { follows, render, screen } from "./render.harness.js";
import { StatTile } from "./StatTile.js";

describe("StatTile", () => {
  it("reads the caption before the value", () => {
    render(<StatTile label="Total interest" value="R 12 400" />);
    expect(follows(screen.getByText("Total interest"), screen.getByText("R 12 400"))).toBeTruthy();
  });

  it("reads the hint after the value", () => {
    render(<StatTile label="A" value="1" hint="left over" />);
    expect(follows(screen.getByText("1"), screen.getByText("left over"))).toBeTruthy();
  });

  it("shows a hint of 0", () => {
    render(<StatTile label="A" value="1" hint={0} />);
    expect(screen.getByText("0")).not.toBeNull();
  });

  it("says only its caption and value without a hint", () => {
    const { container } = render(<StatTile label="A" value="1" />);
    expect(container.textContent).toBe("A1");
  });

  it("adds no text with an accent bar or a trend: both are decoration", () => {
    const { container } = render(
      <StatTile label="A" value="5" tone="positive" accent trend={[1, 3, 2]} hint="up" />,
    );
    expect(container.textContent).toBe("A5up");
  });
});
