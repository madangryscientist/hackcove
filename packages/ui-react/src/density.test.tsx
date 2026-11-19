// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { AppShell } from "./AppShell.js";
import { useInCard } from "./cardContext.js";
import { Card } from "./Card.js";
import { Dialog } from "./Dialog.js";
import { stubDialog } from "./dom.harness.js";
import { Drawer } from "./Drawer.js";
import { DensityProvider, useDensity, useTypeStep } from "./density.js";
import { Button } from "./Button.js";
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

/** Prints whether it sits in a card. */
function CardProbe() {
  return <p>{useInCard() ? "in a card" : "on its own"}</p>;
}

describe("density", () => {
  beforeEach(stubDialog);

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

  it("a container of the default size clears the size of a compact one around it", () => {
    render(
      <Card size="sm">
        <Card>
          <Probe />
        </Card>
      </Card>,
    );
    expect(screen.getByText("md default")).not.toBeNull();
  });

  it("a Dialog or Drawer opened in a compact card starts over: md, and out of the card", () => {
    render(
      <Card size="sm">
        <Dialog title="Delete" onClose={() => undefined} footer={<Probe />}>
          <CardProbe />
        </Dialog>
        <Drawer title="Edit" onClose={() => undefined}>
          <Probe />
        </Drawer>
      </Card>,
    );
    expect(screen.getAllByText("md default")).toHaveLength(2);
    expect(screen.getByText("on its own")).not.toBeNull();
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

  it("a Button with no size in a sized container renders", () => {
    render(
      <Card size="sm">
        <Button>Save</Button>
      </Card>,
    );
    expect(screen.getByRole("button", { name: "Save" })).not.toBeNull();
  });
});
