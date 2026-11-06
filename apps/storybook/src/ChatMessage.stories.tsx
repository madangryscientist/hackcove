import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Button,
  ButtonGroup,
  ChatMessage,
  Image,
  Markdown,
  Pill,
  Stack,
  Text,
} from "@hackcove/ui-react";
import { sampleScenes } from "./sampleScene";

const meta: Meta = {
  title: "Content/ChatMessage",
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

const scene = sampleScenes[0] ?? { src: "", alt: "" };

/** `user` sits on the right on the inset fill, `assistant` on the left on the surface. */
export const Roles: S = {
  render: () => (
    <Stack gap="sm">
      <ChatMessage role="user" author="Ada">
        When does the harbour market open?
      </ChatMessage>
      <ChatMessage role="assistant" author="Helper">
        At eight, every Saturday.
      </ChatMessage>
    </Stack>
  ),
};

/** `meta` is the small line above the bubble: a sender and a time, already formatted. */
export const MetaLine: S = {
  render: () => (
    <Stack gap="sm">
      <ChatMessage role="user" author="Ada" meta="Ada, 09:14">
        Are we still on for lunch?
      </ChatMessage>
      <ChatMessage role="assistant" author="Grace" meta="Grace, 09:16">
        Yes, one o'clock.
      </ChatMessage>
    </Stack>
  ),
};

/** Plain text keeps its line breaks, and a long word wraps inside the bubble. */
export const PlainText: S = {
  render: () => (
    <Stack gap="sm">
      <ChatMessage role="user" author="Ada">
        {"Eggs\nFlour\nButter"}
      </ChatMessage>
      <ChatMessage role="assistant" author="Helper">
        https://example.com/a/very/long/link/that/has/nowhere/to/break/and/runs/on/and/on/past/the/width/of/the/bubble/and/well/beyond/it/all/the/way/to/the/end
      </ChatMessage>
    </Stack>
  ),
};

/** The body is what the caller passes: a `Markdown` for an AI reply, an `Image` for media. */
export const RichBody: S = {
  render: () => (
    <Stack gap="sm">
      <ChatMessage role="assistant" author="Helper">
        <Markdown md={"## The plan\n- **Sweat** the leeks\n- Add the potatoes"} />
      </ChatMessage>
      <ChatMessage role="user" author="Ada">
        <Image src={scene.src} alt={scene.alt} width="lg" aspect="3:2" />
      </ChatMessage>
    </Stack>
  ),
};

/** `actions` is a row under the bubble on the message's own side: buttons or reaction `Pill`s. */
export const Actions: S = {
  render: () => (
    <Stack gap="sm">
      <ChatMessage
        role="assistant"
        author="Helper"
        actions={
          <ButtonGroup>
            <Button size="sm" variant="ghost">
              Copy
            </Button>
            <Button size="sm" variant="ghost">
              Retry
            </Button>
          </ButtonGroup>
        }
      >
        At eight, every Saturday.
      </ChatMessage>
      <ChatMessage
        role="user"
        author="Ada"
        actions={
          <>
            <Pill round>👍 2</Pill>
            <Pill round>🎉 1</Pill>
          </>
        }
      >
        We got the stall.
      </ChatMessage>
    </Stack>
  ),
};

/** `streaming` draws the caret after the reply so far; with no children it is the pending state, the caret alone. */
export const Streaming: S = {
  render: () => (
    <Stack gap="sm">
      <ChatMessage role="assistant" author="Helper" streaming />
      <ChatMessage role="assistant" author="Helper" streaming>
        Start by sweating the leeks in
      </ChatMessage>
    </Stack>
  ),
};

/** A reply still arriving says so with `streaming`: the caret, and `aria-busy` for a screen reader. */
export const DoStreaming: S = {
  render: () => (
    <ChatMessage role="assistant" author="Helper" streaming>
      Start by sweating the leeks in
    </ChatMessage>
  ),
};

/** Dots typed into the body say nothing to a screen reader, and are read out as text when it is done. */
export const DontStreaming: S = {
  render: () => (
    <ChatMessage role="assistant" author="Helper">
      Start by sweating the leeks in...
    </ChatMessage>
  ),
};

/** What to do with a message goes in `actions`, under the bubble and always in view. */
export const DoActions: S = {
  render: () => (
    <ChatMessage
      role="assistant"
      author="Helper"
      actions={
        <Button size="sm" variant="ghost">
          Retry
        </Button>
      }
    >
      The pantry did not answer.
    </ChatMessage>
  ),
};

/** A button in the body reads as part of what was said, and is copied with it. */
export const DontActions: S = {
  render: () => (
    <ChatMessage role="assistant" author="Helper">
      <Text as="p">The pantry did not answer.</Text>
      <Button size="sm" variant="ghost">
        Retry
      </Button>
    </ChatMessage>
  ),
};
