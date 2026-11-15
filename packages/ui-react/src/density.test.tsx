// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { AppShell } from "./AppShell.js";
import { DensityProvider, useDensity, useTypeStep } from "./density.js";
import { Input } from "./Input.js";
import type { Size } from "./size.js";
import { render, screen, user } from "./render.harness.js";

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

  it("AppShell density sets the compact step for everything inside, and nothing else does", () => {
    render(
      <>
        <AppShell density="compact">
          <Probe />
        </AppShell>
        <AppShell>
          <Probe own="sm" />
        </AppShell>
      </>,
    );
    expect(screen.getByText("md compact")).not.toBeNull();
    expect(screen.getByText("sm default")).not.toBeNull();
  });

  it("an Input renders and takes typing under the compact step and without it", async () => {
    render(
      <>
        <AppShell density="compact">
          <Input aria-label="Compact" />
        </AppShell>
        <Input aria-label="Default" />
      </>,
    );
    for (const name of ["Compact", "Default"]) {
      const input = screen.getByRole<HTMLInputElement>("textbox", { name });
      await user().type(input, "hi");
      expect(input.value).toBe("hi");
    }
  });
});
