import { act, type ReactNode } from "react";
import { type Root, createRoot, hydrateRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
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

/**
 * Server-render `node`, mark its <img> as the browser left it (`complete`, `naturalWidth`), then
 * hydrate. jsdom loads no images, so a test sets the state a browser would have. The container is
 * left in the document for `unmount`-free cleanup by the caller (`container.remove()`).
 */
export async function hydrateWith(
  node: ReactNode,
  state: { complete: boolean; naturalWidth: number },
): Promise<HTMLElement> {
  const container = document.createElement("div");
  container.innerHTML = renderToStaticMarkup(node);
  document.body.append(container);
  const img = container.querySelector("img");
  if (!img) throw new Error("no <img> server-rendered");
  Object.defineProperty(img, "complete", { value: state.complete, configurable: true });
  Object.defineProperty(img, "naturalWidth", { value: state.naturalWidth, configurable: true });
  await act(async () => {
    hydrateRoot(container, node);
  });
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

function showPopoverStub(this: HTMLElement): void {
  this.style.display = "block";
}

function hidePopoverStub(this: HTMLElement): void {
  this.style.removeProperty("display");
}

/**
 * Stub the popover API jsdom lacks, as a browser draws it: a popover is not shown (`display: none`,
 * so it is out of the accessibility tree) until `showPopover()`. Call from `beforeEach`; with it,
 * the internal tooltip takes its enhanced path (jsdom's `CSS.supports` says yes to anything).
 */
export function stubPopover(): void {
  // jsdom's selector matching skips a rule on `[popover]` with a second attribute, so the shown
  // state is an inline display, which it does apply.
  HTMLElement.prototype.showPopover = showPopoverStub;
  HTMLElement.prototype.hidePopover = hidePopoverStub;
  if (!document.querySelector("style[data-popover-stub]")) {
    const style = document.createElement("style");
    style.dataset["popoverStub"] = "";
    style.textContent = "[popover]{display:none}";
    document.head.append(style);
  }
}

/** Undo `stubPopover`. Call from `afterEach`. */
export function unstubPopover(): void {
  Reflect.deleteProperty(HTMLElement.prototype, "showPopover");
  Reflect.deleteProperty(HTMLElement.prototype, "hidePopover");
}
