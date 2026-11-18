import { act, type ReactNode } from "react";
import { hydrateRoot } from "react-dom/client";
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

/** The popovers shown and not hidden since: a browser's `:popover-open`, which jsdom lacks. */
const openPopovers = new Set<Element>();

/** Whether `element` is an open popover, as `:popover-open` says in a browser. */
export function popoverOpen(element: Element): boolean {
  return openPopovers.has(element);
}

/** As a browser does, an element with no `popover` attribute refuses to show or hide as one. */
function assertPopover(element: HTMLElement): void {
  if (!element.hasAttribute("popover")) {
    throw new DOMException("Not a popover element", "NotSupportedError");
  }
}

function showPopoverStub(this: HTMLElement): void {
  assertPopover(this);
  openPopovers.add(this);
  this.style.display = "block";
}

function hidePopoverStub(this: HTMLElement): void {
  assertPopover(this);
  openPopovers.delete(this);
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
  openPopovers.clear();
  Reflect.deleteProperty(HTMLElement.prototype, "showPopover");
  Reflect.deleteProperty(HTMLElement.prototype, "hidePopover");
}
