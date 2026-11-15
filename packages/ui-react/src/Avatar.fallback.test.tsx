// @vitest-environment jsdom
import { type ReactElement, useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Avatar } from "./Avatar.js";
import { hydrateWith } from "./dom.harness.js";
import { fireEvent, render, screen, user, within } from "./render.harness.js";

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
  it("shows the initials, titled by the name and hidden from assistive tech, in place of the broken image", () => {
    render(<Avatar name="Ada Lovelace" src="/missing.jpg" />);
    // A failed load is the browser's event; no person makes it.
    fireEvent.error(screen.getByRole("img", { name: "Ada Lovelace" }));
    expect(screen.queryByRole("img")).toBeNull();
    const initials = screen.getByTitle("Ada Lovelace");
    expect(initials.textContent).toBe("AD");
    expect(initials.getAttribute("aria-hidden")).toBe("true");
  });

  it("still calls the consumer's onError, so the fallback does not hide the failure", () => {
    const onError = vi.fn<() => void>();
    render(<Avatar name="Ada Lovelace" src="/missing.jpg" onError={onError} />);
    // A failed load is the browser's event; no person makes it.
    fireEvent.error(screen.getByRole("img", { name: "Ada Lovelace" }));
    expect(onError).toHaveBeenCalledTimes(1);
    expect(screen.getByText("AD")).not.toBeNull();
  });

  it("gives a new src its own try, and shows the photo when it loads", async () => {
    render(<Swap />);
    // A failed load is the browser's event; no person makes it.
    fireEvent.error(screen.getByRole("img", { name: "Ada Lovelace" }));
    expect(screen.queryByRole("img")).toBeNull();
    await user().click(screen.getByRole("button", { name: "swap" }));
    expect(screen.getByRole("img", { name: "Ada Lovelace" }).getAttribute("src")).toBe("/ada.jpg");
  });
});

describe("Avatar whose photo failed before it hydrated", () => {
  const avatar = <Avatar name="Sam Cole" src="/missing.jpg" size="xl" />;
  const hydrated: HTMLElement[] = [];
  // hydrateWith server-renders this to feed a hydration
  const hydrate = async (...args: Parameters<typeof hydrateWith>) => {
    hydrated.push(await hydrateWith(...args));
  };

  afterEach(() => {
    for (const container of hydrated.splice(0)) container.remove();
  });

  it("shows the initials, and no img", async () => {
    await hydrate(avatar, { complete: true, naturalWidth: 0 });
    expect(screen.queryByRole("img")).toBeNull();
    expect(screen.getByText("SA")).not.toBeNull();
  });

  it("does not call the consumer's onError, as there is no event to pass", async () => {
    const onError = vi.fn<() => void>();
    await hydrate(<Avatar name="Sam Cole" src="/missing.jpg" onError={onError} />, {
      complete: true,
      naturalWidth: 0,
    });
    expect(screen.getByText("SA")).not.toBeNull();
    expect(onError).not.toHaveBeenCalled();
  });

  it("keeps the photo when it loaded", async () => {
    await hydrate(avatar, { complete: true, naturalWidth: 56 });
    expect(screen.getByRole("img", { name: "Sam Cole" }).getAttribute("src")).toBe("/missing.jpg");
  });

  it("keeps the photo while it is still loading", async () => {
    await hydrate(avatar, { complete: false, naturalWidth: 0 });
    expect(screen.getByRole("img", { name: "Sam Cole" }).getAttribute("src")).toBe("/missing.jpg");
  });
});

describe("Avatar with onClick", () => {
  it("is one button of type button named by the person, around the initials", async () => {
    const onClick = vi.fn<() => void>();
    render(<Avatar name="Ada Lovelace" onClick={onClick} />);
    const button = screen.getByRole("button", { name: "Ada Lovelace" });
    expect(screen.getAllByRole("button")).toHaveLength(1);
    expect(button.getAttribute("type")).toBe("button");
    expect(within(button).getByText("AD")).not.toBeNull();
    await user().click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("is one button named by the person, around the photo, that a click on the photo presses", async () => {
    const onClick = vi.fn<() => void>();
    render(<Avatar name="Grace Hopper" src="/grace.jpg" onClick={onClick} size="2xl" />);
    const button = screen.getByRole("button", { name: "Grace Hopper" });
    const img = within(button).getByRole("img", { name: "Grace Hopper" });
    expect(img.getAttribute("src")).toBe("/grace.jpg");
    await user().click(img);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("is reached by Tab and pressed by Enter", async () => {
    const onClick = vi.fn<() => void>();
    render(<Avatar name="Ada Lovelace" onClick={onClick} />);
    await user().tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Ada Lovelace" }));
    await user().keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("still falls back to the initials, and reports the failure, inside the button", () => {
    const onError = vi.fn<() => void>();
    render(
      <Avatar name="Ada Lovelace" src="/missing.jpg" onClick={() => undefined} onError={onError} />,
    );
    // A failed load is the browser's event; no person makes it.
    fireEvent.error(screen.getByRole("img", { name: "Ada Lovelace" }));
    expect(onError).toHaveBeenCalledTimes(1);
    const button = screen.getByRole("button", { name: "Ada Lovelace" });
    expect(within(button).queryByRole("img")).toBeNull();
    expect(within(button).getByText("AD")).not.toBeNull();
  });
});
