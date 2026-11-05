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

describe("Avatar with onClick", () => {
  it("is one button named by the person, around the initials", () => {
    const onClick = vi.fn<() => void>();
    const container = mount(<Avatar name="Ada Lovelace" onClick={onClick} data-testid="ada" />);
    const button = container.querySelector("button");
    expect(button?.getAttribute("type")).toBe("button");
    expect(button?.getAttribute("aria-label")).toBe("Ada Lovelace");
    expect(button?.getAttribute("data-testid")).toBe("ada");
    expect(button?.querySelector("span")?.textContent).toBe("AD");
    act(() => button?.click());
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("is one button named by the person, around the photo, with a focus ring", () => {
    const onClick = vi.fn<() => void>();
    const container = mount(
      <Avatar name="Grace Hopper" src="/grace.jpg" onClick={onClick} size="2xl" />,
    );
    const button = container.querySelector("button");
    expect(button?.getAttribute("aria-label")).toBe("Grace Hopper");
    expect(button?.className).toContain("rounded-full");
    expect(button?.className).toContain("focus-visible:outline-violet-600");
    const img = container.querySelector("img");
    expect(img?.getAttribute("src")).toBe("/grace.jpg");
    act(() => img?.click());
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("still falls back to the initials, and reports the failure, inside the button", () => {
    const onError = vi.fn<() => void>();
    const container = mount(
      <Avatar name="Ada Lovelace" src="/missing.jpg" onClick={() => undefined} onError={onError} />,
    );
    fail(container.querySelector("img"));
    expect(onError).toHaveBeenCalledTimes(1);
    const button = container.querySelector("button");
    expect(button?.querySelector("img")).toBeNull();
    expect(button?.querySelector("span")?.textContent).toBe("AD");
  });
});
