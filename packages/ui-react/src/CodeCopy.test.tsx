// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CodeBlock } from "./CodeBlock.js";
import { CodeExample } from "./CodeExample.js";
import { act, render, screen, user } from "./render.harness.js";

const writeText = vi.fn<(text: string) => Promise<void>>();

/** Press the copy button with a fresh user, the clipboard mocked after `user()` set up its own. */
async function pressCopy(): Promise<void> {
  const person = user();
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
  await person.click(screen.getByRole("button", { name: "Copy" }));
}

beforeEach(() => {
  writeText.mockReset().mockResolvedValue(undefined);
});

describe("the copy button on a code block", () => {
  it("copies a string exactly, newlines and indentation kept and nothing added", async () => {
    const code = "if (x) {\n  run --out out\n}";
    render(
      <CodeBlock copy language="ts">
        {code}
      </CodeBlock>,
    );
    await pressCopy();
    expect(writeText).toHaveBeenCalledExactlyOnceWith(code);
  });

  it("copies `lines` joined by newlines, with no trailing newline", async () => {
    render(<CodeBlock copy lines={["bun add a", "bun add b"]} />);
    await pressCopy();
    expect(writeText).toHaveBeenCalledExactlyOnceWith("bun add a\nbun add b");
  });

  it.each(["wrap", "scroll"] as const)(
    "copies the same long line when it does %s",
    async (overflow) => {
      const command = `bunx playwright test ${"--flag value ".repeat(20)}--out out`;
      render(
        <CodeBlock copy overflow={overflow}>
          {command}
        </CodeBlock>,
      );
      await pressCopy();
      expect(writeText).toHaveBeenCalledExactlyOnceWith(command);
    },
  );

  it("copies the markup-free source, not the coloured spans, and announces the copy", async () => {
    render(
      <CodeBlock copy language="bash">
        {"# note\nbun install"}
      </CodeBlock>,
    );
    expect(screen.getByRole("status").textContent).toBe("");
    await pressCopy();
    expect(writeText).toHaveBeenCalledExactlyOnceWith("# note\nbun install");
    expect(screen.getByRole("button", { name: "Copy" })).not.toBeNull();
    expect(screen.getByRole("status").textContent).toBe("Copied");
  });

  it("announces a second copy again, with new text in the status region", async () => {
    render(<CodeBlock copy>x</CodeBlock>);
    await pressCopy();
    const status = screen.getByRole("status");
    const changes: MutationRecord[] = [];
    const observer = new MutationObserver((records) => changes.push(...records));
    observer.observe(status, { childList: true });
    await pressCopy();
    // The observer reports on a microtask.
    await act(async () => {});
    observer.disconnect();
    expect(writeText).toHaveBeenCalledTimes(2);
    expect(changes.some((change) => change.addedNodes.length > 0)).toBe(true);
    expect(status.textContent).toBe("Copied");
  });

  it("copies only the commands of a console block, without the prompt or the output", async () => {
    render(
      <CodeBlock
        copy
        language="console"
        lines={[
          "$ bun add @hackcove/ui-react",
          "installed @hackcove/ui-react@0.1.0",
          "$ bunx playwright test \\",
          "  --project=chromium",
          "2 passed",
        ]}
      />,
    );
    await pressCopy();
    expect(writeText).toHaveBeenCalledExactlyOnceWith(
      "bun add @hackcove/ui-react\nbunx playwright test \\\n  --project=chromium",
    );
  });

  it("copies a console block with no command exactly as given", async () => {
    const code = "installed 1 package\n$HOME";
    render(
      <CodeBlock copy language="console">
        {code}
      </CodeBlock>,
    );
    await pressCopy();
    expect(writeText).toHaveBeenCalledExactlyOnceWith(code);
  });

  it("still copies everything in any other language, a leading $ included", async () => {
    const code = "$ bun add a\nadded 1 package";
    render(
      <CodeBlock copy language="bash">
        {code}
      </CodeBlock>,
    );
    await pressCopy();
    expect(writeText).toHaveBeenCalledExactlyOnceWith(code);
  });

  it("is a real button, reachable and pressable from the keyboard", async () => {
    render(<CodeBlock copy>x</CodeBlock>);
    const person = user();
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    const button = screen.getByRole("button", { name: "Copy" });
    expect(button.getAttribute("type")).toBe("button");
    await person.tab();
    expect(document.activeElement).toBe(button);
    await person.keyboard("{Enter}");
    expect(writeText).toHaveBeenCalledExactlyOnceWith("x");
  });

  it("on a CodeExample copies the code, not the preview", async () => {
    const code = '<Button variant="primary">Save</Button>';
    render(
      <CodeExample copy code={code}>
        <span>PREVIEW</span>
      </CodeExample>,
    );
    await pressCopy();
    expect(writeText).toHaveBeenCalledExactlyOnceWith(code);
  });
});
