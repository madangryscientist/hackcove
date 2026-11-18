// @vitest-environment jsdom
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CodeBody } from "./CodeBody.js";
import { render, user, within } from "./render.harness.js";

afterEach(() => {
  Reflect.deleteProperty(HTMLElement.prototype, "scrollWidth");
  Reflect.deleteProperty(HTMLElement.prototype, "clientWidth");
  vi.unstubAllGlobals();
});

/** jsdom has no layout and no ResizeObserver: say how wide every box's content is and how much shows. */
function overflowing(scrollWidth: number, clientWidth: number) {
  Object.defineProperty(HTMLElement.prototype, "scrollWidth", {
    configurable: true,
    value: scrollWidth,
  });
  Object.defineProperty(HTMLElement.prototype, "clientWidth", {
    configurable: true,
    value: clientWidth,
  });
  // As in a browser, an observer reports once as soon as it starts observing.
  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(private readonly notify: () => void) {}
      observe() {
        this.notify();
      }
      disconnect() {}
    },
  );
}

const LONG = "bunx moon run --concurrency 3 :typecheck :lint :test :build :pack-check";

/** Where focus lands when a person presses Tab once from the top of the page. */
async function firstTabStop(): Promise<HTMLElement> {
  await user().tab();
  const focused = document.activeElement;
  if (!(focused instanceof HTMLElement)) throw new Error("nothing focused");
  return focused;
}

describe("CodeBody", () => {
  it("a strip that scrolls sideways takes a tab stop, with no role and no name", async () => {
    overflowing(900, 300);
    render(<CodeBody code={LONG} language="console" wrap={false} copy={false} />);
    const stop = await firstTabStop();
    expect(within(stop).getByRole("code").textContent).toBe(LONG);
    expect(stop.getAttribute("tabindex")).toBe("0");
    expect(stop.hasAttribute("role")).toBe(false);
    expect(stop.hasAttribute("aria-label")).toBe(false);
  });

  it("a strip that fits takes no tab stop", async () => {
    overflowing(300, 300);
    render(<CodeBody code={LONG} language="console" wrap={false} copy={false} />);
    expect(await firstTabStop()).toBe(document.body);
  });

  it("wrap renders no tab stop, however long the line", async () => {
    overflowing(900, 300);
    render(<CodeBody code={LONG} language="console" wrap copy={false} />);
    expect(await firstTabStop()).toBe(document.body);
  });

  it("a strip rendered to HTML on the server carries its tab stop", () => {
    const html = renderToString(
      <CodeBody code={LONG} language="console" wrap={false} copy={false} />,
    );
    // The strip itself, the box that scrolls sideways, carries the stop.
    expect(html).toMatch(/<div tabindex="0" class="[^"]*overflow-x-auto[^"]*">/);
  });

  it("a wrap strip rendered to HTML on the server has no tab stop", () => {
    const html = renderToString(<CodeBody code={LONG} language="console" wrap copy={false} />);
    expect(html).not.toContain("tabindex");
  });
});
