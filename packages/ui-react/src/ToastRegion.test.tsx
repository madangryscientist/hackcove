// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { Button } from "./Button.js";
import { fireEvent, render, screen, user, within } from "./render.harness.js";
import { type Toast, ToastRegion } from "./ToastRegion.js";

// The region draws the list it is given. The hide is a CSS animation that a real browser runs
// (toast-region.spec.ts); here a fired `animationend` stands in for its end, an event no person
// makes, as the harness allows.

const SAVED: Toast = { id: "saved", tone: "positive", title: "Saved", body: "Your draft is safe." };

/** The toast whose title is `title`: the box that holds it. */
function toastOf(title: string): Element {
  const box = screen.getByText(title).closest("[data-toast]");
  if (!box) throw new Error(`no toast titled ${title}`);
  return box;
}

/**
 * An animation's end, as React hears it in jsdom. jsdom has no `AnimationEvent`, so React listens
 * for the prefixed `webkitAnimationEnd` there, and `fireEvent.animationEnd` (unprefixed) never
 * reaches the handler.
 */
function animationEnd(element: Element): void {
  fireEvent(element, new Event("webkitAnimationEnd", { bubbles: true }));
}

const hideEnd = (title: string) => animationEnd(toastOf(title));

describe("ToastRegion", () => {
  it("keeps a named region with an empty status in the page when there are no toasts", () => {
    render(<ToastRegion toasts={[]} onDismiss={() => undefined} />);
    const region = screen.getByRole("region", { name: "Notifications" });
    const status = within(region).getByRole("status");
    expect(status.textContent).toBe("");
    expect(status.getAttribute("aria-live")).toBe("polite");
  });

  it("puts a toast's title and body inside the status", () => {
    render(<ToastRegion toasts={[SAVED]} onDismiss={() => undefined} />);
    const status = screen.getByRole("status");
    expect(within(status).getByText("Saved")).toBeTruthy();
    expect(within(status).getByText("Your draft is safe.")).toBeTruthy();
  });

  it("calls onDismiss once with the id when Dismiss is clicked", async () => {
    const onDismiss = vi.fn<(id: string) => void>();
    render(<ToastRegion toasts={[SAVED]} onDismiss={onDismiss} />);
    await user().click(screen.getByRole("button", { name: "Dismiss" }));
    expect(onDismiss.mock.calls).toEqual([["saved"]]);
  });

  it("calls onDismiss when a positive toast with no actions ends its hide", () => {
    const onDismiss = vi.fn<(id: string) => void>();
    render(<ToastRegion toasts={[SAVED]} onDismiss={onDismiss} />);
    hideEnd("Saved");
    expect(onDismiss.mock.calls).toEqual([["saved"]]);
  });

  it("never hides a warn, a danger or an actioned toast on its own", () => {
    const onDismiss = vi.fn<(id: string) => void>();
    render(
      <ToastRegion
        toasts={[
          { id: "w", tone: "warn", title: "Offline" },
          { id: "d", tone: "danger", title: "Not saved" },
          {
            id: "u",
            tone: "info",
            title: "Update available",
            actions: <Button size="sm">Reload</Button>,
          },
        ]}
        onDismiss={onDismiss}
      />,
    );
    for (const title of ["Offline", "Not saved", "Update available"]) {
      expect(toastOf(title).hasAttribute("data-toast-hide")).toBe(false);
      hideEnd(title);
    }
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it("ignores an animation that ends on a child", () => {
    const onDismiss = vi.fn<(id: string) => void>();
    render(
      <ToastRegion
        toasts={[
          { id: "u", title: "Update available", actions: <Button size="sm">Reload</Button> },
        ]}
        onDismiss={onDismiss}
      />,
    );
    animationEnd(screen.getByRole("button", { name: "Reload" }));
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it("draws only what is in toasts: a toast left out is gone", () => {
    const { rerender } = render(<ToastRegion toasts={[SAVED]} onDismiss={() => undefined} />);
    rerender(<ToastRegion toasts={[]} onDismiss={() => undefined} />);
    expect(screen.queryByText("Saved")).toBeNull();
    expect(screen.getByRole("region", { name: "Notifications" })).toBeTruthy();
  });

  it("takes label and dismissLabel in place of the default names", () => {
    render(
      <ToastRegion
        toasts={[SAVED]}
        onDismiss={() => undefined}
        label="Meldings"
        dismissLabel="Maak toe"
      />,
    );
    expect(screen.getByRole("region", { name: "Meldings" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Maak toe" })).toBeTruthy();
  });

  it("defaults a toast to the neutral tone, which hides on its own", () => {
    render(<ToastRegion toasts={[{ id: "c", title: "Copied" }]} onDismiss={() => undefined} />);
    expect(toastOf("Copied").hasAttribute("data-toast-hide")).toBe(true);
  });
});
