// @vitest-environment jsdom
import { act } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ChatComposer } from "./ChatComposer.js";
import { mount, unmount } from "./dom.harness.js";

afterEach(unmount);

function parts(root: HTMLElement) {
  return { box: root.querySelector("textarea")!, button: root.querySelector("button")! };
}

function type(box: HTMLTextAreaElement, text: string): void {
  act(() => {
    // Past React's own value tracking, so React sees the input as a change.
    Reflect.set(HTMLTextAreaElement.prototype, "value", text, box);
    box.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

/** Presses a key in the box and says whether the composer kept the browser from acting on it. */
function press(box: HTMLTextAreaElement, init: KeyboardEventInit): boolean {
  const event = new KeyboardEvent("keydown", { bubbles: true, cancelable: true, ...init });
  act(() => {
    box.dispatchEvent(event);
  });
  return event.defaultPrevented;
}

const ENTER = { key: "Enter" };

describe("ChatComposer", () => {
  it("sends the trimmed text on Enter and clears the box", () => {
    const onSend = vi.fn<(text: string) => void>();
    const { box } = parts(mount(<ChatComposer label="Message" onSend={onSend} />));
    type(box, "  hello  ");
    expect(press(box, ENTER)).toBe(true);
    expect(onSend).toHaveBeenCalledExactlyOnceWith("hello");
    expect(box.value).toBe("");
  });

  it("sends from the button, and puts the focus back in the box", () => {
    const onSend = vi.fn<(text: string) => void>();
    const { box, button } = parts(mount(<ChatComposer label="Message" onSend={onSend} />));
    type(box, "hello");
    act(() => button.click());
    expect(onSend).toHaveBeenCalledExactlyOnceWith("hello");
    expect(document.activeElement).toBe(box);
  });

  it("leaves Shift+Enter to the browser: a newline, no send", () => {
    const onSend = vi.fn<(text: string) => void>();
    const { box } = parts(mount(<ChatComposer label="Message" onSend={onSend} />));
    type(box, "hello");
    expect(press(box, { ...ENTER, shiftKey: true })).toBe(false);
    expect(onSend).not.toHaveBeenCalled();
    expect(box.value).toBe("hello");
  });

  it.each([
    ["isComposing", { isComposing: true }],
    ["Safari's 229 keyCode", { keyCode: 229 }],
  ])("leaves Enter to an IME during composition (%s)", (_name, composing) => {
    const onSend = vi.fn<(text: string) => void>();
    const { box } = parts(mount(<ChatComposer label="Message" onSend={onSend} />));
    type(box, "こんにちは");
    expect(press(box, { ...ENTER, ...composing })).toBe(false);
    expect(onSend).not.toHaveBeenCalled();
    expect(box.value).toBe("こんにちは");
  });

  it("does not send whitespace, and disables Send until there is text", () => {
    const onSend = vi.fn<(text: string) => void>();
    const { box, button } = parts(mount(<ChatComposer label="Message" onSend={onSend} />));
    expect(button.disabled).toBe(true);
    type(box, "  \n ");
    expect(button.disabled).toBe(true);
    expect(press(box, ENTER)).toBe(true);
    expect(onSend).not.toHaveBeenCalled();
    expect(box.value).toBe("  \n ");
    type(box, "x");
    expect(button.disabled).toBe(false);
  });

  it("while busy the button is Stop, Enter does not send, and the text stays", () => {
    const onSend = vi.fn<(text: string) => void>();
    const onStop = vi.fn<() => void>();
    const { box, button } = parts(
      mount(<ChatComposer label="Message" busy onSend={onSend} onStop={onStop} />),
    );
    expect(button.textContent).toBe("Stop");
    expect(button.disabled).toBe(false);
    type(box, "next question");
    press(box, ENTER);
    expect(onSend).not.toHaveBeenCalled();
    expect(box.value).toBe("next question");
    act(() => button.click());
    expect(onStop).toHaveBeenCalledOnce();
    expect(onSend).not.toHaveBeenCalled();
    expect(box.value).toBe("next question");
  });

  it("busy with no onStop leaves Send disabled and draws no Stop", () => {
    const { box, button } = parts(
      mount(<ChatComposer label="Message" busy onSend={vi.fn<(text: string) => void>()} />),
    );
    type(box, "next question");
    expect(button.textContent).toBe("Send");
    expect(button.disabled).toBe(true);
  });

  it("disabled disables the box and the button, Stop included", () => {
    const { box, button } = parts(
      mount(
        <ChatComposer
          label="Message"
          disabled
          busy
          onSend={vi.fn<(text: string) => void>()}
          onStop={vi.fn<() => void>()}
        />,
      ),
    );
    expect(box.disabled).toBe(true);
    expect(button.disabled).toBe(true);
  });

  it("names the box with a hidden label, in two rows, and takes its own words", () => {
    const root = mount(
      <ChatComposer
        label="Message"
        placeholder="Ask"
        sendLabel="Post"
        onSend={vi.fn<(text: string) => void>()}
      />,
    );
    const { box, button } = parts(root);
    expect(root.querySelector("form")).not.toBeNull();
    expect(box.labels?.[0]?.textContent).toBe("Message");
    expect(box.labels?.[0]?.className).toBe("sr-only");
    expect(box.rows).toBe(2);
    expect(box.placeholder).toBe("Ask");
    expect(button.textContent).toBe("Post");
  });
});
