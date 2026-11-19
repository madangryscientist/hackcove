import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button, Callout, Stack, Text, type Toast, ToastRegion } from "@slashsuite/ui-react";

const meta: Meta = {
  title: "Feedback/Toast",
  // Room above the region, which is fixed to the bottom of the viewport.
  decorators: [
    (Story) => (
      <div className="min-h-80">
        <Story />
      </div>
    ),
  ],
};
export default meta;
type S = StoryObj;

/** A confirmation is a toast the app adds to the list it holds: it leaves on its own after five seconds. */
export const DoSaved: S = {
  render: () => {
    const [toasts, setToasts] = useState<Toast[]>([]);
    return (
      <>
        <Button
          onClick={() =>
            setToasts((all) => [
              ...all,
              { id: crypto.randomUUID(), tone: "positive", title: "Saved" },
            ])
          }
        >
          Save
        </Button>
        <ToastRegion
          toasts={toasts}
          onDismiss={(id) => setToasts((all) => all.filter((toast) => toast.id !== id))}
        />
      </>
    );
  },
};

/** A save notice pushed into the page flow moves the form under the reader and never leaves. */
export const DontSaved: S = {
  render: () => (
    <Stack gap="sm">
      <Callout tone="positive">Details saved</Callout>
      <Text>The form the reader was filling in, now a line lower.</Text>
    </Stack>
  ),
};

/** A notice with an action keeps it in `actions`: it stays until the action or Dismiss. */
export const DoAction: S = {
  render: () => {
    const [toasts, setToasts] = useState<Toast[]>([
      {
        id: "update",
        tone: "info",
        title: "Update available",
        body: "Reload to get the new version.",
        actions: <Button size="sm">Reload</Button>,
      },
    ]);
    return (
      <ToastRegion
        toasts={toasts}
        onDismiss={(id) => setToasts((all) => all.filter((toast) => toast.id !== id))}
      />
    );
  },
};

/**
 * An action put in `body` is not an action to the region: the toast still leaves after five
 * seconds, taking the button with it before the reader reaches it.
 */
export const DontAction: S = {
  render: () => (
    <ToastRegion
      onDismiss={() => undefined}
      toasts={[
        {
          id: "update",
          tone: "info",
          title: "Update available",
          body: <Button size="sm">Reload</Button>,
        },
      ]}
    />
  ),
};

/** One toast of each tone, all of which stay (each `warn`, `danger` or with an action), for the shot. */
export const Tones: S = {
  render: () => (
    <ToastRegion
      onDismiss={() => undefined}
      toasts={[
        {
          id: "neutral",
          title: "Draft kept",
          body: "It is in your drafts.",
          actions: <Button size="sm">Open</Button>,
        },
        {
          id: "info",
          tone: "info",
          title: "Update available",
          actions: <Button size="sm">Reload</Button>,
        },
        {
          id: "positive",
          tone: "positive",
          title: "Invite sent",
          actions: <Button size="sm">Undo</Button>,
        },
        { id: "warn", tone: "warn", title: "Offline", body: "Changes save when you reconnect." },
        { id: "danger", tone: "danger", title: "Not saved", body: "The server did not answer." },
      ]}
    />
  ),
};
