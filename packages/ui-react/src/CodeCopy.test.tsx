// @vitest-environment jsdom
import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CodeBlock } from "./CodeBlock.js";
import { CodeExample } from "./CodeExample.js";
import { mount, unmount } from "./dom.harness.js";

const writeText = vi.fn<(text: string) => Promise<void>>();

beforeEach(() => {
  writeText.mockReset().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
});

afterEach(() => {
  unmount();
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

  it("copies the markup-free source, not the coloured spans, and marks the copy", async () => {
    const container = mount(
      <CodeBlock copy language="bash">
        {"# note\nbun install"}
      </CodeBlock>,
    );
    const button = buttonOf(container);
    const status = container.querySelector("[data-copy-status]");
    expect(button.hasAttribute("data-copied")).toBe(false);
    expect(status?.textContent).toBe("");
    await press(button);
    expect(writeText).toHaveBeenCalledExactlyOnceWith("# note\nbun install");
    expect(button.hasAttribute("data-copied")).toBe(true);
    expect(button.getAttribute("aria-label")).toBe("copy");
    expect(status?.textContent).toBe("copied");
  });

  it("restarts the labels and puts a new node in the status region on a second copy", async () => {
    const container = mount(<CodeBlock copy>x</CodeBlock>);
    const button = buttonOf(container);
    await press(button);
    const idle = button.querySelector("[data-copy-idle]");
    const said = container.querySelector("[data-copy-status]")?.firstChild;
    await press(button);
    expect(writeText).toHaveBeenCalledTimes(2);
    expect(button.querySelector("[data-copy-idle]")).not.toBe(idle);
    const again = container.querySelector("[data-copy-status]")?.firstChild;
    expect(again).not.toBe(said);
    expect(again?.textContent).toBe("copied");
  });

  it("copies only the commands of a console block, without the prompt or the output", async () => {
    const container = mount(
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
    await press(buttonOf(container));
    expect(writeText).toHaveBeenCalledExactlyOnceWith(
      "bun add @hackcove/ui-react\nbunx playwright test \\\n  --project=chromium",
    );
  });

  it("copies a console block with no command exactly as given", async () => {
    const code = "installed 1 package\n$HOME";
    const container = mount(
      <CodeBlock copy language="console">
        {code}
      </CodeBlock>,
    );
    await press(buttonOf(container));
    expect(writeText).toHaveBeenCalledExactlyOnceWith(code);
  });

  it("still copies everything in any other language, a leading $ included", async () => {
    const code = "$ bun add a\nadded 1 package";
    const container = mount(
      <CodeBlock copy language="bash">
        {code}
      </CodeBlock>,
    );
    await press(buttonOf(container));
    expect(writeText).toHaveBeenCalledExactlyOnceWith(code);
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
