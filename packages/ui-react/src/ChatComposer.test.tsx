// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { ChatComposer } from "./ChatComposer.js";
import { fireEvent, render, screen, user } from "./render.harness.js";

function setup(busy = false) {
  const onSend = vi.fn<(text: string) => void>();
  const onStop = vi.fn<() => void>();
  render(<ChatComposer label="Message" busy={busy} onSend={onSend} onStop={onStop} />);
  return { onSend, onStop, box: screen.getByRole("textbox", { name: "Message" }) };
}

function valueOf(box: HTMLElement): string {
  expect(box).toBeInstanceOf(HTMLTextAreaElement);
  return box instanceof HTMLTextAreaElement ? box.value : "";
}

function disabled(element: HTMLElement): boolean {
  return element.hasAttribute("disabled");
}

describe("ChatComposer", () => {
  it("sends the trimmed text on Enter and clears the box", async () => {
    const { onSend, box } = setup();
    await user().type(box, "  hello  {Enter}");
    expect(onSend).toHaveBeenCalledExactlyOnceWith("hello");
    expect(valueOf(box)).toBe("");
  });

  it("sends from the button, and puts the focus back in the box", async () => {
    const { onSend, box } = setup();
    await user().type(box, "hello");
    await user().click(screen.getByRole("button", { name: "Send" }));
    expect(onSend).toHaveBeenCalledExactlyOnceWith("hello");
    expect(document.activeElement).toBe(box);
  });

  it("leaves Shift+Enter to the browser: a newline, no send", async () => {
    const { onSend, box } = setup();
    await user().type(box, "hello{Shift>}{Enter}{/Shift}");
    expect(onSend).not.toHaveBeenCalled();
    expect(valueOf(box)).toBe("hello\n");
  });

  it.each([
    ["isComposing", { isComposing: true }],
    ["Safari's 229 keyCode", { keyCode: 229 }],
  ])("leaves Enter to an IME during composition (%s)", async (_name, composing) => {
    const { onSend, box } = setup();
    await user().type(box, "こんにちは");
    // user-event cannot compose with an IME: the Enter that commits a composition is fired by hand.
    // fireEvent returns false when the composer kept the browser from acting on the key.
    expect(fireEvent.keyDown(box, { key: "Enter", ...composing })).toBe(true);
    expect(onSend).not.toHaveBeenCalled();
    expect(valueOf(box)).toBe("こんにちは");
  });

  it("does not send whitespace, and disables Send until there is text", async () => {
    const { onSend, box } = setup();
    const send = screen.getByRole("button", { name: "Send" });
    expect(disabled(send)).toBe(true);
    await user().type(box, "  {Shift>}{Enter}{/Shift} ");
    expect(disabled(send)).toBe(true);
    await user().type(box, "{Enter}");
    expect(onSend).not.toHaveBeenCalled();
    // Enter was still kept from the box: no second newline.
    expect(valueOf(box)).toBe("  \n ");
    await user().type(box, "x");
    expect(disabled(send)).toBe(false);
  });

  it("while busy the button is Stop, Enter does not send, and the text stays", async () => {
    const { onSend, onStop, box } = setup(true);
    const stop = screen.getByRole("button", { name: "Stop" });
    expect(disabled(stop)).toBe(false);
    await user().type(box, "next question{Enter}");
    expect(onSend).not.toHaveBeenCalled();
    expect(valueOf(box)).toBe("next question");
    await user().click(stop);
    expect(onStop).toHaveBeenCalledOnce();
    expect(onSend).not.toHaveBeenCalled();
    expect(valueOf(box)).toBe("next question");
  });

  it("busy with no onStop leaves Send disabled and draws no Stop", async () => {
    render(<ChatComposer label="Message" busy onSend={vi.fn<(text: string) => void>()} />);
    await user().type(screen.getByRole("textbox", { name: "Message" }), "next question");
    expect(disabled(screen.getByRole("button", { name: "Send" }))).toBe(true);
    expect(screen.queryByRole("button", { name: "Stop" })).toBeNull();
  });

  it("disabled disables the box and the button, Stop included", () => {
    render(
      <ChatComposer
        label="Message"
        disabled
        busy
        onSend={vi.fn<(text: string) => void>()}
        onStop={vi.fn<() => void>()}
      />,
    );
    expect(disabled(screen.getByRole("textbox", { name: "Message" }))).toBe(true);
    expect(disabled(screen.getByRole("button", { name: "Stop" }))).toBe(true);
  });

  it("names the box by its label and takes its own placeholder and button word", () => {
    render(
      <ChatComposer
        label="Message"
        placeholder="Ask"
        sendLabel="Post"
        onSend={vi.fn<(text: string) => void>()}
      />,
    );
    expect(screen.getByRole("textbox", { name: "Message" }).getAttribute("placeholder")).toBe(
      "Ask",
    );
    expect(screen.getByRole("button", { name: "Post" })).not.toBeNull();
  });
});
