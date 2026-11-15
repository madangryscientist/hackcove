// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { DensityProvider, useDensity, useTypeStep } from "./density.js";
import type { Size } from "./size.js";
import { render, screen } from "./render.harness.js";

/** Prints what a part inside reads, so the test asserts the value, not a class. */
function Probe({ own }: { own?: Size }) {
  return (
    <p>
      {useDensity(own)} {useTypeStep() ?? "default"}
    </p>
  );
}

describe("density", () => {
  it("is md and the default step with no provider", () => {
    render(<Probe />);
    expect(screen.getByText("md default")).not.toBeNull();
  });

  it("an own size wins over the container's", () => {
    render(
      <DensityProvider size="sm">
        <Probe own="lg" />
      </DensityProvider>,
    );
    expect(screen.getByText("lg default")).not.toBeNull();
  });

  it("a nested container's size keeps the type step set above it", () => {
    render(
      <DensityProvider type="compact">
        <DensityProvider size="sm">
          <Probe />
        </DensityProvider>
      </DensityProvider>,
    );
    expect(screen.getByText("sm compact")).not.toBeNull();
  });
});
