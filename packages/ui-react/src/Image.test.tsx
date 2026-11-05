// @vitest-environment jsdom
import { act, type ReactElement, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";
import { mount, unmount } from "./dom.harness.js";
import { Image } from "./Image.js";

afterEach(unmount);

/** React 19 hoists a `<link rel="preload">` ahead of an `<img>` in static markup. */
const PRELOAD = /<link rel="preload"[^>]*>/;

/** Fire the `error` event a browser fires when an <img> fails to load. */
function fail(img: HTMLImageElement | null): void {
  if (!img) throw new Error("no <img> rendered");
  act(() => {
    img.dispatchEvent(new Event("error"));
  });
}

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

const classes = (width: "sm" | "md" | "lg" | "full") =>
  /class="([^"]*)"/.exec(renderToStaticMarkup(<Image alt="A" width={width} />))?.[1] ?? "";

describe("Image", () => {
  it("is an <img> named by alt, rounded, framed and cropped to a 4:3 box by default", () => {
    const out = renderToStaticMarkup(<Image src="/a.jpg" alt="A harbour" />);
    expect(out.replace(PRELOAD, "").startsWith("<img")).toBe(true);
    expect(out).toContain('src="/a.jpg"');
    expect(out).toContain('alt="A harbour"');
    for (const part of ["aspect-[4/3]", "object-cover", "rounded-lg", "w-full", "border"]) {
      expect(out).toContain(part);
    }
  });

  it("takes an aspect, a fit and a width as named choices", () => {
    const out = renderToStaticMarkup(
      <Image src="/qr.png" alt="QR" aspect="square" fit="contain" width="md" />,
    );
    expect(out).toContain("aspect-square");
    expect(out).toContain("object-contain");
    expect(out).not.toContain("object-cover");
    expect(out).toContain("w-40 max-w-full");
  });

  it("sets each size as a real width that a narrow parent still caps", () => {
    for (const [width, expected] of [
      ["sm", "w-24 max-w-full"],
      ["md", "w-40 max-w-full"],
      ["lg", "w-64 max-w-full"],
    ] as const) {
      expect(classes(width)).toContain(expected);
    }
    expect(classes("full")).toContain("w-full");
    expect(classes("full")).not.toContain("max-w");
  });

  it("maps every aspect to its own box", () => {
    const boxes = (["square", "4:3", "3:2", "16:9", "3:4", "9:16"] as const).map(
      (aspect) =>
        /aspect-[^ "]+/.exec(renderToStaticMarkup(<Image src="/a" alt="A" aspect={aspect} />))?.[0],
    );
    expect(new Set(boxes).size).toBe(6);
  });

  it("shows a same-sized placeholder, named by alt, when no src is given", () => {
    const out = renderToStaticMarkup(<Image alt="No preview" aspect="16:9" />);
    expect(out.startsWith("<span")).toBe(true);
    expect(out).toContain('role="img"');
    expect(out).toContain('aria-label="No preview"');
    expect(out).toContain("aspect-video");
    expect(out).toContain("<svg");
    expect(out).not.toContain("<img");
  });

  it("hides the placeholder from a screen reader when alt is empty", () => {
    const out = renderToStaticMarkup(<Image alt="" />);
    expect(out).toContain('aria-hidden="true"');
    expect(out).not.toContain("role=");
  });

  it("swaps a picture that fails to load for the placeholder, keeping its box", () => {
    const container = mount(<Image src="/missing.png" alt="Pairing code" aspect="square" />);
    fail(container.querySelector("img"));
    expect(container.querySelector("img")).toBeNull();
    const placeholder = container.querySelector('[role="img"]');
    expect(placeholder?.getAttribute("aria-label")).toBe("Pairing code");
    expect(placeholder?.className).toContain("aspect-square");
  });

  it("gives a new src its own try after one failed", () => {
    const container = mount(<Swap />);
    fail(container.querySelector("img"));
    expect(container.querySelector("img")).toBeNull();
    act(() => container.querySelector("button")?.click());
    expect(container.querySelector("img")?.getAttribute("src")).toBe("/code.png");
  });
});
