// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { ChatMessage } from "./ChatMessage.js";
import { mount, unmount } from "./dom.harness.js";

afterEach(unmount);

const articleOf = (root: HTMLElement) => root.querySelector("article")!;
const caretOf = (root: HTMLElement) => root.querySelector('[aria-hidden="true"]');

describe("ChatMessage", () => {
  it("is an article with the author first, for a screen reader only", () => {
    const article = articleOf(
      mount(
        <ChatMessage role="user" author="Ada" meta="09:14">
          Hello
        </ChatMessage>,
      ),
    );
    const first = article.firstElementChild;
    expect(first?.textContent).toBe("Ada");
    expect(first?.className).toBe("sr-only");
  });

  it("puts each role on its own side and fill", () => {
    const user = articleOf(
      mount(
        <ChatMessage role="user" author="Ada">
          Hello
        </ChatMessage>,
      ),
    );
    expect(user.className).toContain("items-end");
    expect(user.innerHTML).toContain("bg-slate-100");
    unmount();
    const assistant = articleOf(
      mount(
        <ChatMessage role="assistant" author="Helper">
          Hello
        </ChatMessage>,
      ),
    );
    expect(assistant.className).toContain("items-start");
    expect(assistant.innerHTML).toContain("border-slate-200");
  });

  it("keeps a plain body's line breaks", () => {
    const root = mount(
      <ChatMessage role="user" author="Ada">
        {"one\ntwo"}
      </ChatMessage>,
    );
    const body = Array.from(root.querySelectorAll("div")).find(
      (el) => el.textContent === "one\ntwo",
    );
    expect(body?.className).toContain("whitespace-pre-wrap");
  });

  it("draws meta above the bubble and actions under it", () => {
    const article = articleOf(
      mount(
        <ChatMessage role="assistant" author="Helper" meta="Helper, 09:14" actions="Copy">
          Hello
        </ChatMessage>,
      ),
    );
    expect(Array.from(article.children).map((part) => part.textContent)).toEqual([
      "Helper",
      "Helper, 09:14",
      "Hello",
      "Copy",
    ]);
  });

  it("is not busy and draws no caret when it is not streaming", () => {
    const root = mount(
      <ChatMessage role="assistant" author="Helper">
        Hello
      </ChatMessage>,
    );
    expect(articleOf(root).hasAttribute("aria-busy")).toBe(false);
    expect(caretOf(root)).toBeNull();
  });

  it("streaming sets aria-busy and draws a hidden caret after the body, pulsing under motion-safe only", () => {
    const root = mount(
      <ChatMessage role="assistant" author="Helper" streaming>
        Hel
      </ChatMessage>,
    );
    expect(articleOf(root).getAttribute("aria-busy")).toBe("true");
    const caret = caretOf(root);
    expect(caret?.previousSibling?.textContent).toBe("Hel");
    expect(caret?.className.split(" ")).toContain("motion-safe:animate-pulse");
    expect(caret?.className.split(" ")).not.toContain("animate-pulse");
  });

  it("empty and streaming draws the bubble with the caret alone", () => {
    const root = mount(<ChatMessage role="assistant" author="Helper" streaming />);
    expect(caretOf(root)?.parentElement?.textContent).toBe("▍");
  });
});
