// @vitest-environment jsdom
import { act } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { mount, unmount } from "./dom.harness.js";
import { MediaTile } from "./MediaTile.js";

afterEach(unmount);

/** React 19 hoists a `<link rel="preload">` ahead of an `<img>` in static markup. */
const PRELOAD = /<link rel="preload"[^>]*>/;

describe("MediaTile", () => {
  it("is a plain block with a 3:4 thumbnail, 160px wide, when it has no onClick", () => {
    const out = renderToStaticMarkup(<MediaTile src="/a.jpg" alt="Status from Anna" />);
    expect(out.replace(PRELOAD, "").startsWith("<div")).toBe(true);
    expect(out).not.toContain("<button");
    expect(out).toContain('alt="Status from Anna"');
    expect(out).toContain("aspect-[3/4]");
    expect(out).toContain("w-40 max-w-full");
    expect(out).not.toContain("bg-black");
  });

  it("puts the label on the media scrim and the caption under the picture", () => {
    const out = renderToStaticMarkup(
      <MediaTile src="/a.jpg" alt="Photo" label="Anna" caption="Today, 09:12" />,
    );
    expect(out).toMatch(/<span class="[^"]*bg-black\/90[^"]*text-white[^"]*">Anna<\/span>/);
    expect(out).toContain("Today, 09:12");
    expect(out.indexOf("Anna")).toBeLessThan(out.indexOf("Today, 09:12"));
  });

  it("draws a hidden play mark only for a video", () => {
    expect(renderToStaticMarkup(<MediaTile src="/a.jpg" alt="Clip" video />)).toContain(
      "rounded-full bg-black/90",
    );
    expect(renderToStaticMarkup(<MediaTile src="/a.jpg" alt="Clip" />)).not.toContain(
      "rounded-full",
    );
  });

  it("is one button that calls onClick, named by its picture and label", () => {
    const onClick = vi.fn<() => void>();
    const container = mount(
      <MediaTile src="/a.jpg" alt="Photo from Anna" label="Anna" onClick={onClick} />,
    );
    const button = container.querySelector("button");
    expect(button?.getAttribute("type")).toBe("button");
    expect(button?.textContent).toBe("Anna");
    expect(button?.querySelector("img")?.getAttribute("alt")).toBe("Photo from Anna");
    act(() => container.querySelector("img")?.click());
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("shows the placeholder and its label when there is no picture, as an Earlier tile does", () => {
    const out = renderToStaticMarkup(
      <MediaTile alt="Earlier statuses" label="Earlier" width="sm" />,
    );
    expect(out).toContain('role="img"');
    expect(out).toContain(">Earlier</span>");
    expect(out).toContain("w-24 max-w-full");
  });

  it("fills its parent at width full", () => {
    const out = renderToStaticMarkup(<MediaTile src="/a.jpg" alt="Photo" width="full" />);
    expect(out).not.toContain("max-w");
  });
});
