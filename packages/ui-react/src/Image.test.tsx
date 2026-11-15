// @vitest-environment jsdom
import { type ReactElement, useState } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { hydrateWith } from "./dom.harness.js";
import { Image } from "./Image.js";
import { fireEvent, render, screen, user } from "./render.harness.js";

function Swap(): ReactElement {
  const [src, setSrc] = useState("/missing.png");
  return (
    <>
      <Image src={src} alt="Pairing code" />
      <button type="button" onClick={() => setSrc("/code.png")}>
        swap
      </button>
    </>
  );
}

describe("Image", () => {
  it("is an img named by alt, showing its src", () => {
    render(<Image src="/a.jpg" alt="A harbour" />);
    const img = screen.getByRole("img", { name: "A harbour" });
    expect(img.tagName).toBe("IMG");
    expect(img.getAttribute("src")).toBe("/a.jpg");
  });

  it("shows a placeholder image named by alt, and no img, when no src is given", () => {
    render(<Image alt="No preview" aspect="16:9" />);
    expect(screen.getByRole("img", { name: "No preview" }).tagName).not.toBe("IMG");
    expect(screen.getAllByRole("img")).toHaveLength(1);
  });

  it("hides the placeholder from a screen reader when alt is empty", () => {
    // An empty alt leaves the placeholder no accessible name to find it by, which is the point.
    render(<Image alt="" data-testid="placeholder" />);
    expect(screen.getByTestId("placeholder").getAttribute("aria-hidden")).toBe("true");
    expect(screen.queryByRole("img", { hidden: true })).toBeNull();
  });

  it("swaps a picture that fails to load for the placeholder, named by alt", () => {
    render(<Image src="/missing.png" alt="Pairing code" aspect="square" />);
    // A failed load is the browser's event; no person makes it.
    fireEvent.error(screen.getByRole("img", { name: "Pairing code" }));
    const placeholder = screen.getByRole("img", { name: "Pairing code" });
    expect(placeholder.tagName).not.toBe("IMG");
    expect(placeholder.hasAttribute("src")).toBe(false);
  });

  it("gives a new src its own try after one failed", async () => {
    render(<Swap />);
    // A failed load is the browser's event; no person makes it.
    fireEvent.error(screen.getByRole("img", { name: "Pairing code" }));
    expect(screen.getByRole("img", { name: "Pairing code" }).tagName).not.toBe("IMG");
    await user().click(screen.getByRole("button", { name: "swap" }));
    expect(screen.getByRole("img", { name: "Pairing code" }).getAttribute("src")).toBe("/code.png");
  });
});

describe("Image whose picture failed before it hydrated", () => {
  const image = <Image src="/missing.png" alt="Pairing code" aspect="square" />;
  const hydrated: HTMLElement[] = [];
  // hydrateWith server-renders this to feed a hydration
  const hydrate = async (...args: Parameters<typeof hydrateWith>) => {
    hydrated.push(await hydrateWith(...args));
  };

  afterEach(() => {
    for (const container of hydrated.splice(0)) container.remove();
  });

  it("shows the placeholder named by alt, and no img", async () => {
    await hydrate(image, { complete: true, naturalWidth: 0 });
    const placeholder = screen.getByRole("img", { name: "Pairing code" });
    expect(placeholder.tagName).not.toBe("IMG");
    expect(screen.getAllByRole("img")).toHaveLength(1);
  });

  it("keeps the picture when it loaded", async () => {
    await hydrate(image, { complete: true, naturalWidth: 120 });
    expect(screen.getByRole("img", { name: "Pairing code" }).getAttribute("src")).toBe(
      "/missing.png",
    );
  });

  it("keeps the picture while it is still loading", async () => {
    await hydrate(image, { complete: false, naturalWidth: 0 });
    expect(screen.getByRole("img", { name: "Pairing code" }).getAttribute("src")).toBe(
      "/missing.png",
    );
  });
});
