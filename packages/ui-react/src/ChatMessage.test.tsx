// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { ChatMessage } from "./ChatMessage.js";
import { follows, render, screen } from "./render.harness.js";

describe("ChatMessage", () => {
  it("is an article that reads the author, then meta, the body and the actions", () => {
    render(
      <ChatMessage role="assistant" author="Helper" meta="Helper, 09:14" actions="Copy">
        Hello
      </ChatMessage>,
    );
    expect(screen.getByRole("article").textContent).toBe("HelperHelper, 09:14HelloCopy");
    const author = screen.getByText("Helper");
    const meta = screen.getByText("Helper, 09:14");
    const body = screen.getByText("Hello");
    const actions = screen.getByText("Copy");
    expect(follows(author, meta)).toBe(true);
    expect(follows(meta, body)).toBe(true);
    expect(follows(body, actions)).toBe(true);
  });

  it("reads the author before the body for either role", () => {
    for (const role of ["user", "assistant"] as const) {
      const { unmount } = render(
        <ChatMessage role={role} author="Ada">
          Hello
        </ChatMessage>,
      );
      expect(screen.getByRole("article").textContent).toBe("AdaHello");
      unmount();
    }
  });

  it("is not busy and draws no caret when it is not streaming", () => {
    render(
      <ChatMessage role="assistant" author="Helper">
        Hello
      </ChatMessage>,
    );
    expect(screen.getByRole("article").hasAttribute("aria-busy")).toBe(false);
    expect(screen.queryByText("▍")).toBeNull();
  });

  it("streaming sets aria-busy and draws a caret, hidden from assistive tech, after the body", () => {
    render(
      <ChatMessage role="assistant" author="Helper" streaming>
        <p>Hel</p>
      </ChatMessage>,
    );
    expect(screen.getByRole("article").getAttribute("aria-busy")).toBe("true");
    const caret = screen.getByText("▍");
    expect(caret.getAttribute("aria-hidden")).toBe("true");
    expect(follows(screen.getByText("Hel"), caret)).toBe(true);
  });

  it("empty and streaming draws the caret alone", () => {
    render(<ChatMessage role="assistant" author="Helper" streaming />);
    expect(screen.getByRole("article").textContent).toBe("Helper▍");
  });
});
