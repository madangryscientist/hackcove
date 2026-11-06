import type { Meta, StoryObj } from "@storybook/react-vite";
import { ChatComposer, Stack } from "@hackcove/ui-react";

const meta: Meta = {
  title: "Content/ChatComposer",
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

const noop = () => undefined;

/** Enter sends and Shift+Enter is a newline; Send stays disabled until there is text. */
export const Default: S = {
  render: () => <ChatComposer label="Message" placeholder="Ask a question" onSend={noop} />,
};

/** While `busy` the button is Stop, and the reader can go on typing the next message. */
export const Busy: S = {
  render: () => (
    <ChatComposer label="Message" placeholder="Ask a question" busy onSend={noop} onStop={noop} />
  ),
};

/** `busy` with no `onStop`, for a reply that cannot be stopped: Send stays disabled and no Stop is drawn. */
export const BusyNoStop: S = {
  render: () => <ChatComposer label="Message" placeholder="Ask a question" busy onSend={noop} />,
};

/** `disabled` turns off the box and the button, for a chat that cannot take a message at all. */
export const Disabled: S = {
  render: () => (
    <ChatComposer label="Message" placeholder="This chat is closed" disabled onSend={noop} />
  ),
};

/** `sendLabel` and `stopLabel` are the button's words. */
export const Labels: S = {
  render: () => (
    <Stack gap="sm">
      <ChatComposer label="Message" sendLabel="Post" onSend={noop} />
      <ChatComposer label="Reply" stopLabel="Cancel" busy onSend={noop} onStop={noop} />
    </Stack>
  ),
};

/** While a reply arrives, `busy` keeps the box open and offers Stop. */
export const DoBusy: S = {
  render: () => (
    <ChatComposer label="Message" busy onSend={() => undefined} onStop={() => undefined} />
  ),
};

/** `disabled` during a reply takes the box away from a reader mid-thought, with no way to stop the reply. */
export const DontBusy: S = {
  render: () => <ChatComposer label="Message" disabled onSend={() => undefined} />,
};
