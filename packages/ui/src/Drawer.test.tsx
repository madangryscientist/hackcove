// @vitest-environment jsdom
import { act } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { dialogOf, mount, showModal, stubDialog, unmount } from "./dom.harness.js";
import { Drawer } from "./Drawer.js";

beforeEach(stubDialog);
afterEach(unmount);

describe("Drawer", () => {
  it("opens as a modal on mount", () => {
    const out = mount(<Drawer title="Item" onClose={() => {}} />);
    expect(showModal).toHaveBeenCalledExactlyOnceWith(dialogOf(out));
  });

  it("slides in and out with transitions that survive the dialog leaving the top layer", () => {
    const out = renderToStaticMarkup(<Drawer title="t" onClose={() => {}} />);
    expect(out).toContain("transition-discrete");
    expect(out).toContain("starting:open:translate-x-full");
    expect(out).toContain("backdrop:transition-discrete");
    expect(out).toContain("motion-reduce:transition-none");
  });

  it("closes the dialog when the parent unmounts it, so focus returns to the opener", () => {
    const dialog = dialogOf(mount(<Drawer title="Item" onClose={() => {}} />));
    expect(dialog.hasAttribute("open")).toBe(true);
    unmount();
    expect(dialog.hasAttribute("open")).toBe(false);
  });

  it("is named by its title and shows the body and footer", () => {
    const out = mount(
      <Drawer title="Item 12" footer={<button type="button">Save</button>} onClose={() => {}}>
        <p>Body text</p>
      </Drawer>,
    );
    const dialog = dialogOf(out);
    const heading = dialog.querySelector("h2");
    expect(heading?.textContent).toBe("Item 12");
    expect(dialog.getAttribute("aria-labelledby")).toBe(heading?.id);
    expect(dialog.textContent).toContain("Body text");
    expect(dialog.querySelector("footer")?.textContent).toBe("Save");
  });

  it("scrolls the body between a fixed header and footer", () => {
    const out = renderToStaticMarkup(
      <Drawer title="t" footer="f" onClose={() => {}}>
        body
      </Drawer>,
    );
    expect(out).toMatch(/<header class="[^"]*shrink-0/);
    expect(out).toMatch(/<div class="[^"]*overflow-y-auto[^"]*">body<\/div>/);
    expect(out).toMatch(/<footer class="[^"]*shrink-0/);
  });

  it("renders no footer when none is given", () => {
    expect(renderToStaticMarkup(<Drawer title="t" onClose={() => {}} />)).not.toContain("<footer");
  });

  it("anchors to the right edge, full height, and sizes the width", () => {
    const md = renderToStaticMarkup(<Drawer title="t" onClose={() => {}} />);
    expect(md).toContain("right-0");
    expect(md).toContain("h-dvh");
    expect(md).toContain("w-110");
    expect(renderToStaticMarkup(<Drawer title="t" size="sm" onClose={() => {}} />)).toContain(
      "w-80",
    );
    expect(renderToStaticMarkup(<Drawer title="t" size="lg" onClose={() => {}} />)).toContain(
      "w-160",
    );
  });

  it("only shows as a flex column while open, so it is not drawn before showModal", () => {
    const out = renderToStaticMarkup(<Drawer title="t" onClose={() => {}} />);
    expect(out).toContain("open:flex");
    expect(out.match(/<dialog[^>]*>/)?.[0]).not.toMatch(/(?<![:\w-])flex(?![\w-])/);
  });

  it("calls onClose when the dialog closes (Esc fires the same event)", async () => {
    const onClose = vi.fn<() => void>();
    const out = mount(<Drawer title="t" onClose={onClose} />);
    await act(async () => dialogOf(out).close());
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes on a click on the scrim, which is a click on the <dialog> itself", async () => {
    const onClose = vi.fn<() => void>();
    const out = mount(<Drawer title="t" onClose={onClose} />);
    await act(async () => dialogOf(out).click());
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes from the close button, named by closeLabel", async () => {
    const onClose = vi.fn<() => void>();
    const out = mount(<Drawer title="t" closeLabel="Dismiss" onClose={onClose} />);
    const button = out.querySelector("button");
    expect(button?.getAttribute("aria-label")).toBe("Dismiss");
    await act(async () => button?.click());
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not close on a click inside the panel", () => {
    const onClose = vi.fn<() => void>();
    const out = mount(
      <Drawer title="t" onClose={onClose}>
        <button type="button">inner</button>
      </Drawer>,
    );
    act(() => out.querySelectorAll("button")[1]?.click());
    act(() => out.querySelector("h2")?.click());
    expect(onClose).not.toHaveBeenCalled();
  });
});
