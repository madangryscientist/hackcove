// @vitest-environment jsdom
import { Script, runInNewContext } from "node:vm";
import type { ReactNode } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CodeBlock } from "./CodeBlock.js";
import { CopyButton } from "./CopyButton.js";
import { CopyLine } from "./CopyLine.js";
import { copyScript } from "./copyScript.js";
import { act, screen, user } from "./render.harness.js";

const writeText = vi.fn<(text: string) => Promise<void>>();

/**
 * The page as the server sent it, with the script loaded and no React on it. The script's subject is
 * server markup that never hydrates, so the server render feeds the page here, as `hydrateWith` does.
 */
function staticPage(node: ReactNode): HTMLDivElement {
  const container = document.createElement("div");
  container.innerHTML = renderToStaticMarkup(node); // the server page the script runs on
  document.body.append(container);
  return container;
}

/** The server page, then React hydrating it, as a page that loads both does. */
async function hydratedPage(node: ReactNode): Promise<void> {
  const container = staticPage(node);
  await act(async () => {
    hydrateRoot(container, node);
  });
}

let person = user();

/** A click, then the clipboard promise settling. */
const press = async (name?: string): Promise<void> => {
  const button = screen.getByRole("button", name === undefined ? {} : { name });
  await act(async () => {
    await person.click(button);
  });
};

let abort = new AbortController();

beforeEach(() => {
  abort = new AbortController();
  // user-event puts its own clipboard on `navigator` when it is set up, so set it up first.
  person = user();
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

  it("copies a static button's text and announces the copied label", async () => {
    staticPage(<CopyButton text="bun add x" />);
    expect(screen.getByRole("status").textContent).toBe("");
    await press();
    expect(writeText).toHaveBeenCalledExactlyOnceWith("bun add x");
    expect(screen.getByRole("status").textContent).toBe("Copied");
  });

  it("announces the button's own copied label", async () => {
    staticPage(<CopyButton text="t" label="Copy token" copiedLabel="Token copied" />);
    await press("Copy token");
    expect(screen.getByRole("status").textContent).toBe("Token copied");
  });

  it("puts a new node in the region on a second copy, so a screen reader hears it again", async () => {
    staticPage(<CopyButton text="t" />);
    await press();
    const added: Node[] = [];
    new MutationObserver((records) =>
      added.push(...records.flatMap((r) => [...r.addedNodes])),
    ).observe(screen.getByRole("status"), { childList: true });
    await press();
    // The observer reports on a microtask; the act around the click has let it run.
    expect(added).toHaveLength(1);
    expect(screen.getByRole("status").textContent).toBe("Copied");
  });

  it("copies a code block's code exactly", async () => {
    const code = "if (x) {\n  run --out out\n}";
    staticPage(
      <CodeBlock copy language="ts">
        {code}
      </CodeBlock>,
    );
    await press();
    expect(writeText).toHaveBeenCalledExactlyOnceWith(code);
  });

  it("copies only the commands of a console block", async () => {
    staticPage(
      <CodeBlock copy language="console">
        {"$ bun add @hackcove/ui-react\nadded 1 package\n$ bun run build"}
      </CodeBlock>,
    );
    await press();
    expect(writeText).toHaveBeenCalledExactlyOnceWith("bun add @hackcove/ui-react\nbun run build");
  });

  it("works on a CopyLine", async () => {
    staticPage(<CopyLine text="npm i x" />);
    await press();
    expect(writeText).toHaveBeenCalledExactlyOnceWith("npm i x");
  });

  it("leaves the label alone when the clipboard refuses", async () => {
    writeText.mockRejectedValue(new Error("denied"));
    staticPage(<CopyButton text="t" />);
    await press();
    expect(screen.getByRole("status").textContent).toBe("");
  });

  it("leaves the label alone when there is no clipboard", async () => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: undefined });
    staticPage(<CopyButton text="t" />);
    await press();
    expect(screen.getByRole("status").textContent).toBe("");
  });

  it("ignores a click that is not on a copy button", async () => {
    staticPage(<p>text</p>);
    await act(async () => {
      await person.click(screen.getByText("text"));
    });
    expect(writeText).not.toHaveBeenCalled();
  });

  it("copies once on a hydrated button: React copies, the script stays out", async () => {
    await hydratedPage(<CopyButton text="once" />);
    await press();
    expect(writeText).toHaveBeenCalledExactlyOnceWith("once");
    expect(screen.getByRole("status").textContent).toBe("Copied");
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
    await hydratedPage(<CopyButton text="first" />);
    await press();
    expect(writeText).toHaveBeenCalledExactlyOnceWith("first");
  });

  it("leaves a submit button's own action alone", async () => {
    const submitted = vi.fn<(event: { preventDefault: () => void }) => void>((event) =>
      event.preventDefault(),
    );
    await hydratedPage(
      <form onSubmit={submitted}>
        <CopyButton text="t" type="submit" />
      </form>,
    );
    await press();
    expect(submitted).toHaveBeenCalledOnce();
  });

  it("hydrates without a warning after the script marked a copy", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const errors: unknown[] = [];
    const node = <CopyButton text="early" />;
    const container = staticPage(node);
    await press();
    expect(screen.getByRole("status").textContent).toBe("Copied");
    await act(async () => {
      hydrateRoot(container, node, { onRecoverableError: (e) => errors.push(e) });
    });
    expect(errors).toEqual([]);
    expect(error).not.toHaveBeenCalled();
  });
});
