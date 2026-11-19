// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { CodeBlock } from "./CodeBlock.js";
import { render, screen, user, within } from "./render.harness.js";

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

describe("CodeBlock", () => {
  it("shows a string as code, newlines kept", () => {
    const code = "bun add @hackcove/ui-react\nbun install";
    render(<CodeBlock>{code}</CodeBlock>);
    expect(screen.getByRole("code").textContent).toBe(code);
  });

  it("shows `lines` as the same text as the equivalent string", () => {
    render(
      <>
        <CodeBlock lines={["a", "b", "c"]} />
        <CodeBlock>{"a\nb\nc"}</CodeBlock>
      </>,
    );
    const [fromLines, fromString] = screen.getAllByRole("code").map((code) => code.textContent);
    expect(fromLines).toBe("a\nb\nc");
    expect(fromLines).toBe(fromString);
  });

  it.each([
    ["text", "wrap"],
    ["bash", "wrap"],
    ["tsx", "wrap"],
    ["text", "scroll"],
    ["bash", "scroll"],
    ["tsx", "scroll"],
  ] as const)(
    "holds the source byte for byte in %s with overflow %s, no invisible characters added",
    (language, overflow) => {
      const code = 'a  b\n\t--flag-x  "quoted string"\n# comment here\n';
      render(
        <CodeBlock language={language} overflow={overflow}>
          {code}
        </CodeBlock>,
      );
      const text = screen.getByRole("code").textContent;
      expect(text).toBe(code);
      expect(text).not.toMatch(/[\u2010\u2011\u2012\u2013\u2014\u2015\u2060\u00a0\u200b\u00ad]/);
    },
  );

  it("shows its label as the code's caption", () => {
    render(<CodeBlock label="theme.css">x</CodeBlock>);
    // jsdom names no figure from its figcaption (a browser does), so the caption is found by text.
    expect(within(screen.getByRole("figure")).getByText("theme.css")).not.toBeNull();
  });

  it("has no caption without a label: the figure holds the code alone", () => {
    render(<CodeBlock>x</CodeBlock>);
    expect(screen.getByRole("figure").textContent).toBe("x");
  });

  it("a scrolling strip with a label is a tab stop named by that label", async () => {
    overflowing(900, 300);
    render(
      <CodeBlock label="bash" overflow="scroll">
        {"bun install --frozen-lockfile --verbose --dry-run --some-very-long-flag-name"}
      </CodeBlock>,
    );
    await user().tab();
    const stop = document.activeElement;
    expect(stop).toBe(screen.getByRole("group", { name: "bash" }));
    expect(stop?.getAttribute("tabindex")).toBe("0");
  });

  it("a scrolling strip with no label is a tab stop named Code", async () => {
    overflowing(900, 300);
    render(
      <CodeBlock overflow="scroll">
        {"bun install --frozen-lockfile --verbose --dry-run --some-very-long-flag-name"}
      </CodeBlock>,
    );
    await user().tab();
    expect(document.activeElement).toBe(screen.getByRole("group", { name: "Code" }));
  });

  it("has no copy button, and so no client JS, unless `copy` is set", () => {
    render(<CodeBlock>x</CodeBlock>);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("with `copy` has a button named by its label", () => {
    render(<CodeBlock copy>x</CodeBlock>);
    expect(screen.getByRole("button", { name: "Copy" }).getAttribute("type")).toBe("button");
  });
});
