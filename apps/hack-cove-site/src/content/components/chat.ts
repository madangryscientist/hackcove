import type { ComponentPage } from "./types";

/** The pages for a chat: they sit in the Content section of the rail, after the pictures. */
export const chatPages: ComponentPage[] = [
  {
    slug: "chat-thread",
    name: "ChatThread",
    summary: "The scrolling box of a chat, which follows the newest message.",
    whenToUse: "Holding the messages and tool calls of a chat, an agent log or a message thread.",
    pairs: ["ChatThread/Empty"],
    usage: [
      "Name it with `label`. Its children are `ChatMessage`s, `ToolCallCard`s and anything else that belongs in the conversation, in order, oldest first.",
      "It starts at the bottom and stays there as content grows, a streamed reply included. When the reader scrolls up it leaves them where they are; scrolling back to the bottom (within 32px) follows again. You write no scrolling of your own.",
      "`height` caps it: `sm`, `md` (default) or `lg`. `fill` takes the height of a parent that sets one, for a whole-page chat.",
      "`empty` is what it draws with no children, an `EmptyState`.",
      'Set `announce` when a message is finished ("Helper replied"), not on each token.',
      "An approval is a `Callout` with `Button`s in its `actions`, placed in the thread, not a component of its own. So is a notice beside a message.",
      "It knows nothing about where messages come from: no fetch, no AI SDK. Map your own messages to its children.",
    ],
    accessibility: [
      'The box is `role="region"` named by `label`, with `tabIndex={0}`, so a keyboard can reach it and scroll it with the arrow keys. Use a different `label` for each thread on a page.',
      'It is deliberately not `role="log"` and has no `aria-live`: a live region round streamed text reads every token aloud. `announce` goes in a visually hidden `aria-live="polite"` element beside the box.',
      "Following the bottom is instant, never a smooth scroll.",
    ],
    api: ["ChatThread"],
  },
  {
    slug: "chat-message",
    name: "ChatMessage",
    summary: "One message in a chat, as a bubble on the sender's side.",
    whenToUse: "A message from a person or an assistant inside a `ChatThread`.",
    pairs: ["ChatMessage/Streaming", "ChatMessage/Actions"],
    usage: [
      "`role` picks the side: `user` on the right, `assistant` on the left.",
      "`author` is required and is for a screen reader. To show a sender and a time, pass them, already formatted, as `meta`, the small line above the bubble.",
      "The children are the body and it does not call `Markdown` for you: pass plain text, which keeps its line breaks, or a `Markdown` or an `Image`.",
      "`actions` is a row under the bubble on the message's own side: copy, retry, a row of reaction `Pill`s. It is always in view, never only on hover.",
      "`streaming` marks a reply still arriving, with a caret after the body. With no children it draws the bubble with the caret alone: the pending state.",
    ],
    accessibility: [
      "It is an `<article>`. `author` comes first in the DOM, visually hidden, because alignment tells a screen reader nothing.",
      "`streaming` sets `aria-busy`. The caret is `aria-hidden`, and it pulses only for a reader who has not asked for reduced motion.",
      "A message is not announced as it arrives: that is the `ChatThread`'s `announce`.",
    ],
    api: ["ChatMessage"],
  },
  {
    slug: "chat-composer",
    name: "ChatComposer",
    summary: "The box a chat message is typed into, with its send button.",
    whenToUse: "The foot of a chat, under the `ChatThread`.",
    pairs: ["ChatComposer/Busy"],
    usage: [
      "Give it a `label` and `onSend`. It keeps its own text and calls `onSend` with it trimmed, then clears the box.",
      "Enter sends and Shift+Enter is a newline. Empty or whitespace-only text does not send, and Send is disabled.",
      "`busy` is a reply on its way: the button is Stop and calls `onStop`, Enter does not send, and the reader can go on typing. With no `onStop`, Send stays disabled and no Stop is drawn.",
      "`disabled` is for a chat that cannot take a message at all; it disables the box and the button.",
      "`sendLabel` and `stopLabel` are the button's words, Send and Stop by default.",
    ],
    accessibility: [
      "`label` is the box's name, in a visually hidden `<label>`.",
      "Enter during an IME composition commits the text and does not send.",
      "After Send is pressed the focus goes back to the box, since the button has just been disabled under it.",
    ],
    api: ["ChatComposer"],
  },
  {
    slug: "tool-call-card",
    name: "ToolCallCard",
    summary: "One tool call in a chat: a line that says how it went, and the detail behind it.",
    whenToUse: "Showing that an assistant called a tool, in a `ChatThread`.",
    pairs: ["ToolCallCard/Detail"],
    usage: [
      "`name` is the tool, in the monospace face. `summary` is one line on what it did; a long one is cut off.",
      "`status` is `running`, `done` or `error`, drawn as a `Pill` reading Running, Done or Failed.",
      "The children are the arguments and the result, shown when it is opened; a `CodeBlock` suits them. It starts closed and keeps its own state.",
    ],
    accessibility: [
      "It is a bordered `Disclosure`: the line is a real `<button>` with `aria-expanded`, and Enter and Space toggle it.",
      "The status is a word, so colour is never the only signal.",
    ],
    api: ["ToolCallCard"],
  },
];
