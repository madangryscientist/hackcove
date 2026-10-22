import { act, type ReactNode } from "react";
import { type Root, createRoot } from "react-dom/client";
import { vi } from "vitest";

Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);

/** Every call to `showModal`, with the dialog it was called on. */
export const showModal = vi.fn<(dialog: HTMLDialogElement) => void>();

function showModalStub(this: HTMLDialogElement): void {
  showModal(this);
  this.setAttribute("open", "");
}

// A browser's close() fires the `close` event; jsdom has no modal <dialog> at all.
function closeStub(this: HTMLDialogElement): void {
  this.removeAttribute("open");
  this.dispatchEvent(new Event("close"));
}

/** Stub the modal <dialog> methods jsdom lacks. Call from `beforeEach`. */
export function stubDialog(): void {
  showModal.mockClear();
  HTMLDialogElement.prototype.showModal = showModalStub;
  HTMLDialogElement.prototype.close = closeStub;
}

let mounted: { root: Root; container: HTMLElement } | undefined;

/** Render into the document, so React's delegated events and `closest` work. Call `unmount` in `afterEach`. */
export function mount(node: ReactNode): HTMLElement {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  mounted = { root, container };
  act(() => root.render(node));
  return container;
}

export function unmount(): void {
  if (!mounted) return;
  const { root, container } = mounted;
  act(() => root.unmount());
  container.remove();
  mounted = undefined;
}

export function dialogOf(container: HTMLElement): HTMLDialogElement {
  const dialog = container.querySelector("dialog");
  if (!dialog) throw new Error("no <dialog> rendered");
  return dialog;
}
