// @vitest-environment jsdom
import { act, type ReactElement, useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Avatar } from "./Avatar.js";
import { mount, unmount } from "./dom.harness.js";

afterEach(unmount);

/** Fire the `error` event a browser fires when an <img> fails to load. */
function fail(img: HTMLImageElement | null): void {
  if (!img) throw new Error("no <img> rendered");
  act(() => {
    img.dispatchEvent(new Event("error"));
  });
}

/** A `src` the test can change, through a button, after the first image has failed. */
function Swap(): ReactElement {
  const [src, setSrc] = useState("/missing.jpg");
  return (
    <>
      <Avatar name="Ada Lovelace" src={src} />
      <button type="button" onClick={() => setSrc("/ada.jpg")}>
        swap
      </button>
    </>
  );
}

describe("Avatar when its photo fails to load", () => {
  it("shows the initials in place of the broken image", () => {
    const container = mount(<Avatar name="Ada Lovelace" src="/missing.jpg" />);
    fail(container.querySelector("img"));
    expect(container.querySelector("img")).toBeNull();
    const initials = container.querySelector("span");
    expect(initials?.textContent).toBe("AD");
    expect(initials?.getAttribute("aria-hidden")).toBe("true");
    expect(initials?.getAttribute("title")).toBe("Ada Lovelace");
  });

  it("still calls the consumer's onError, so the fallback does not hide the failure", () => {
    const onError = vi.fn<() => void>();
    const container = mount(<Avatar name="Ada Lovelace" src="/missing.jpg" onError={onError} />);
    fail(container.querySelector("img"));
    expect(onError).toHaveBeenCalledTimes(1);
    expect(container.querySelector("span")?.textContent).toBe("AD");
  });

  it("gives a new src its own try, and shows the photo when it loads", () => {
    const container = mount(<Swap />);
    fail(container.querySelector("img"));
    expect(container.querySelector("img")).toBeNull();

    const swap = container.querySelector("button");
    act(() => swap?.click());
    const retry = container.querySelector("img");
    expect(retry?.getAttribute("src")).toBe("/ada.jpg");
  });
});
