// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { Badge } from "./Badge.js";
import { render, screen } from "./render.harness.js";

describe("Badge", () => {
  it("shows its count", () => {
    render(<Badge count={3} />);
    expect(screen.getByText("3")).not.toBeNull();
  });

  it("caps a large count at 99+", () => {
    render(
      <>
        <Badge count={120} />
        <Badge count={99} />
      </>,
    );
    expect(screen.getByText("99+")).not.toBeNull();
    expect(screen.getByText("99")).not.toBeNull();
  });
});
