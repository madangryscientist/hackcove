// @vitest-environment jsdom
import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CodeBlock } from "./CodeBlock.js";
import { CodeExample } from "./CodeExample.js";
import { mount, unmount } from "./dom.harness.js";

const writeText = vi.fn<(text: string) => Promise<void>>();

beforeEach(() => {
  vi.useFakeTimers();
  writeText.mockReset().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
});

afterEach(() => {
  unmount();
  vi.useRealTimers();
});

const buttonOf = (container: HTMLElement): HTMLButtonElement => {
  const button = container.querySelector("button");
  if (!button) throw new Error("no copy button");
  return button;
};

const press = async (button: HTMLButtonElement): Promise<void> => {
  await act(async () => button.click());
};

describe("the copy button on a code block", () => {
  it("copies a string exactly, newlines and indentation kept and nothing added", async () => {
    const code = "if (x) {\n  run --out out\n}";
    const container = mount(
      <CodeBlock copy language="ts">
        {code}
      </CodeBlock>,
    );
    await press(buttonOf(container));
    expect(writeText).toHaveBeenCalledExactlyOnceWith(code);
  });

  it("copies `lines` joined by newlines, with no trailing newline", async () => {
    const container = mount(<CodeBlock copy lines={["bun add a", "bun add b"]} />);
    await press(buttonOf(container));
    expect(writeText).toHaveBeenCalledExactlyOnceWith("bun add a\nbun add b");
  });

  it("copies the same long line whether it wraps or scrolls", async () => {
    const command = `bunx playwright test ${"--flag value ".repeat(20)}--out out`;
    for (const overflow of ["wrap", "scroll"] as const) {
      writeText.mockClear();
      const container = mount(
        <CodeBlock copy overflow={overflow}>
          {command}
        </CodeBlock>,
      );
      await press(buttonOf(container));
      expect(writeText).toHaveBeenCalledExactlyOnceWith(command);
      unmount();
    }
  });

  it("copies the markup-free source, not the coloured spans, and shows copied then copy again", async () => {
    const container = mount(
      <CodeBlock copy language="bash">
        {"# note\nbun install"}
      </CodeBlock>,
    );
    const button = buttonOf(container);
    expect(button.textContent).toBe("copy");
    await press(button);
    expect(writeText).toHaveBeenCalledExactlyOnceWith("# note\nbun install");
    expect(button.textContent).toBe("copied");
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });
    expect(button.textContent).toBe("copy");
  });

  it("is a real button, reachable and pressable from the keyboard", () => {
    const container = mount(<CodeBlock copy>x</CodeBlock>);
    const button = buttonOf(container);
    expect(button.tagName).toBe("BUTTON");
    expect(button.type).toBe("button");
    expect(button.tabIndex).toBe(0);
    expect(button.disabled).toBe(false);
  });

  it("on a CodeExample copies the code, not the preview", async () => {
    const code = '<Button variant="primary">Save</Button>';
    const container = mount(
      <CodeExample copy code={code}>
        <span>PREVIEW</span>
      </CodeExample>,
    );
    await press(buttonOf(container));
    expect(writeText).toHaveBeenCalledExactlyOnceWith(code);
  });
});
