// @vitest-environment jsdom
import { Script, runInNewContext } from "node:vm";
import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CodeBlock } from "./CodeBlock.js";
import { CopyButton } from "./CopyButton.js";
import { CopyLine } from "./CopyLine.js";
import { copyScript } from "./copyScript.js";

const writeText = vi.fn<(text: string) => Promise<void>>();

/** The page as the server sent it, with the script loaded and no React on it. */
function staticPage(node: React.ReactNode): HTMLElement {
  const container = document.createElement("div");
  container.innerHTML = renderToStaticMarkup(node);
  document.body.append(container);
  return container;
}

/** What the region beside a button says: the copied label after a copy, nothing before. */
const statusOf = (button: HTMLButtonElement): string | null | undefined =>
  button.nextElementSibling?.matches("[data-copy-status]")
    ? button.nextElementSibling.textContent
    : undefined;

const buttonOf = (container: HTMLElement): HTMLButtonElement => {
  const button = container.querySelector("button");
  if (!button) throw new Error("no copy button");
  return button;
};

/** A click, then the clipboard promise settling. */
const press = async (button: HTMLButtonElement): Promise<void> => {
  await act(async () => button.click());
};

let abort = new AbortController();

beforeEach(() => {
  abort = new AbortController();
  writeText.mockReset().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
  // The script adds a listener to `document`; remove it after each test.
  const add = document.addEventListener.bind(document);
  vi.spyOn(document, "addEventListener").mockImplementation((type, listener, options) =>
    add(type, listener, { ...(typeof options === "object" ? options : {}), signal: abort.signal }),
  );
  runInNewContext(copyScript, { document, navigator });
});

afterEach(() => {
  abort.abort();
  vi.restoreAllMocks();
  document.body.replaceChildren();
});

describe("copyScript", () => {
  it("is valid JavaScript under 1000 characters", () => {
    expect(() => new Script(copyScript)).not.toThrow();
    expect(copyScript.length).toBeLessThan(1000);
  });

  it("is not time dependent: it sets no timer", () => {
    expect(copyScript).not.toMatch(/set(?:Timeout|Interval)|requestAnimation/);
  });

  it("copies a static button's text, marks it copied and announces the copied label", async () => {
    const button = buttonOf(staticPage(<CopyButton text="bun add x" />));
    expect(statusOf(button)).toBe("");
    await press(button);
    expect(writeText).toHaveBeenCalledExactlyOnceWith("bun add x");
    expect(button.hasAttribute("data-copied")).toBe(true);
    expect(statusOf(button)).toBe("copied");
  });

  it("announces the button's own copied label", async () => {
    const button = buttonOf(
      staticPage(<CopyButton text="t" label="Copy token" copiedLabel="Token copied" />),
    );
    await press(button);
    expect(statusOf(button)).toBe("Token copied");
  });

  it("re-sets data-copied and puts a new node in the region on a second copy", async () => {
    const button = buttonOf(staticPage(<CopyButton text="t" />));
    await press(button);
    const first = button.nextElementSibling?.firstChild;
    const was: (string | null)[] = [];
    new MutationObserver((records) => was.push(...records.map((r) => r.oldValue))).observe(button, {
      attributeFilter: ["data-copied"],
      attributeOldValue: true,
    });
    await press(button);
    // Removed (it was ""), then set again (it was absent): the restart the CSS animation needs.
    expect(was).toEqual(["", null]);
    expect(button.hasAttribute("data-copied")).toBe(true);
    const second = button.nextElementSibling?.firstChild;
    expect(second).not.toBe(first);
    expect(statusOf(button)).toBe("copied");
  });

  it("copies a code block's code exactly", async () => {
    const code = "if (x) {\n  run --out out\n}";
    const button = buttonOf(
      staticPage(
        <CodeBlock copy language="ts">
          {code}
        </CodeBlock>,
      ),
    );
    await press(button);
    expect(writeText).toHaveBeenCalledExactlyOnceWith(code);
  });

  it("copies only the commands of a console block", async () => {
    const button = buttonOf(
      staticPage(
        <CodeBlock copy language="console">
          {"$ bun add @hackcove/ui-react\nadded 1 package\n$ bun run build"}
        </CodeBlock>,
      ),
    );
    await press(button);
    expect(writeText).toHaveBeenCalledExactlyOnceWith("bun add @hackcove/ui-react\nbun run build");
  });

  it("works on a CopyLine", async () => {
    const button = buttonOf(staticPage(<CopyLine text="npm i x" />));
    await press(button);
    expect(writeText).toHaveBeenCalledExactlyOnceWith("npm i x");
  });

  it("leaves the label alone when the clipboard refuses", async () => {
    writeText.mockRejectedValue(new Error("denied"));
    const button = buttonOf(staticPage(<CopyButton text="t" />));
    await press(button);
    expect(button.hasAttribute("data-copied")).toBe(false);
    expect(statusOf(button)).toBe("");
  });

  it("leaves the label alone when there is no clipboard", async () => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: undefined });
    const button = buttonOf(staticPage(<CopyButton text="t" />));
    await press(button);
    expect(button.hasAttribute("data-copied")).toBe(false);
    expect(statusOf(button)).toBe("");
  });

  it("ignores a click that is not on a copy button", async () => {
    const container = staticPage(<p>text</p>);
    await act(async () => container.querySelector("p")?.click());
    expect(writeText).not.toHaveBeenCalled();
  });

  it("copies once on a hydrated button: React copies, the script stays out", async () => {
    const node = <CopyButton text="once" />;
    const container = staticPage(node);
    await act(async () => {
      hydrateRoot(container, node);
    });
    const button = buttonOf(container);
    await press(button);
    expect(writeText).toHaveBeenCalledExactlyOnceWith("once");
    expect(button.hasAttribute("data-copied")).toBe(true);
    expect(statusOf(button)).toBe("copied");
  });

  it("copies once when the script hears the click before React does", async () => {
    // The script's listener in the capture phase, so it runs ahead of React's root listener.
    runInNewContext(copyScript, {
      document: {
        addEventListener: (type: string, listener: EventListener) =>
          document.addEventListener(type, listener, { capture: true, signal: abort.signal }),
      },
      navigator,
    });
    const node = <CopyButton text="first" />;
    const container = staticPage(node);
    await act(async () => {
      hydrateRoot(container, node);
    });
    await press(buttonOf(container));
    expect(writeText).toHaveBeenCalledExactlyOnceWith("first");
  });

  it("leaves a submit button's own action alone", async () => {
    const node = (
      <form>
        <CopyButton text="t" type="submit" />
      </form>
    );
    const container = staticPage(node);
    await act(async () => {
      hydrateRoot(container, node);
    });
    const submitted = vi.fn<(event: Event) => void>((event) => event.preventDefault());
    container.querySelector("form")?.addEventListener("submit", submitted);
    await press(buttonOf(container));
    expect(submitted).toHaveBeenCalledOnce();
  });

  it("hydrates without a warning after the script marked a copy", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const errors: unknown[] = [];
    const node = <CopyButton text="early" />;
    const container = staticPage(node);
    await press(buttonOf(container));
    expect(statusOf(buttonOf(container))).toBe("copied");
    await act(async () => {
      hydrateRoot(container, node, { onRecoverableError: (e) => errors.push(e) });
    });
    expect(errors).toEqual([]);
    expect(error).not.toHaveBeenCalled();
    expect(buttonOf(container).hasAttribute("data-copied")).toBe(true);
  });
});
