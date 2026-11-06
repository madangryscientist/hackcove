import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, ChatMessage, ChatThread, EmptyState, Stack, Text } from "@hackcove/ui-react";
import { SampleChat } from "./sampleChat";

const meta: Meta = {
  title: "Content/ChatThread",
  parameters: { layout: "padded" },
  // A chat takes the width it is given, so a story gives it a realistic one.
  decorators: [
    (Story) => (
      <Stack width="narrow">
        <Story />
      </Stack>
    ),
  ],
};
export default meta;
type S = StoryObj;

function message(index: number) {
  return (
    <ChatMessage key={index} role={index % 2 === 0 ? "user" : "assistant"} author="Sample">
      Message {index + 1}
    </ChatMessage>
  );
}

const messages = (count: number) => Array.from({ length: count }, (_, index) => message(index));

/** A short thread takes the height it needs, up to `height`. */
export const Messages: S = {
  render: () => <ChatThread label="Short chat">{messages(3)}</ChatThread>,
};

/** A long thread scrolls, and starts at the bottom. `sm`, `md` and `lg` cap it at 20, 28 and 40rem. */
export const Heights: S = {
  render: () => (
    <ChatThread label="Long chat" height="sm">
      {messages(20)}
    </ChatThread>
  ),
};

/** `fill` takes the height of a parent that sets one, a whole-page chat. */
export const Fill: S = {
  render: () => (
    <div className="h-64">
      <ChatThread label="Page chat" height="fill">
        {messages(20)}
      </ChatThread>
    </div>
  ),
};

/** Tab reaches the box, and the arrow keys scroll it. `announce` sits beside it, read out and not drawn. */
export const Announce: S = {
  render: () => (
    <ChatThread label="Announcing chat" height="sm" announce="Helper finished replying">
      {messages(20)}
    </ChatThread>
  ),
};

/** `empty` is drawn when there are no children. */
export const Empty: S = {
  render: () => (
    <ChatThread label="New chat" empty={<EmptyState title="No messages yet" level={3} />} />
  ),
};

function AddMessageDemo() {
  const [count, setCount] = useState(20);
  return (
    <Stack gap="sm">
      <Button onClick={() => setCount(count + 1)}>Add message</Button>
      <ChatThread label="Growing chat" height="sm">
        {messages(count)}
      </ChatThread>
      <Text as="p" color="muted">
        {count} messages
      </Text>
    </Stack>
  );
}

/** It follows new content; scroll up and it leaves you there; scroll back down and it follows again. */
export const AddMessage: S = { render: () => <AddMessageDemo /> };

/** The whole chat: all four parts, an approval from a `Callout` and `Button`s, and a reply still streaming. */
export const ToolCallAndApproval: S = {
  name: "Chat with a tool call and an approval",
  render: () => <SampleChat label="Cooking chat" />,
};

/** Nothing to show yet is the thread's `empty`, which goes away with the first message. */
export const DoEmpty: S = {
  render: () => (
    <ChatThread label="New chat" empty={<EmptyState title="No messages yet" level={3} />} />
  ),
};

/** A made-up message is not an empty state: a screen reader reads it as something somebody said. */
export const DontEmpty: S = {
  render: () => (
    <ChatThread label="New chat">
      <ChatMessage role="assistant" author="Helper">
        No messages yet
      </ChatMessage>
    </ChatThread>
  ),
};
