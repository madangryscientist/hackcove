import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Button,
  Card,
  Dialog,
  IconButton,
  type LinkAdapter,
  LinkProvider,
  ListRow,
  Menu,
  type MenuAction,
  Text,
} from "@slashsuite/ui-react";
import { useState } from "react";

const meta: Meta = {
  title: "Actions/Menu",
  // Room under the trigger for the open menu, which is laid over the page.
  decorators: [
    (Story) => (
      <div className="min-h-72 max-w-md">
        <Story />
      </div>
    ),
  ],
};
export default meta;
type S = StoryObj;

/** Stands in for a router's <Link>: the app's adapter, set once on a `LinkProvider`. */
const FakeLink: LinkAdapter = ({ href, ...rest }) => <a {...rest} href={`#${href}`} />;

const noop = () => undefined;

const ROW_ACTIONS: [MenuAction, ...MenuAction[]] = [
  { label: "Favourite", icon: "plus", onSelect: () => undefined },
  { label: "Settings", icon: "settings", onSelect: () => undefined },
  { label: "Hide chat", tone: "danger", onSelect: () => undefined },
];

/** A row's secondary actions in one `Menu`, beside its one visible action. */
export const DoOverflow: S = {
  render: () => (
    <Card flush>
      <ListRow
        size="sm"
        actions={
          <>
            <Button size="sm" variant="outline">
              Reply
            </Button>
            <Menu
              size="sm"
              label="More actions"
              items={[
                { label: "Favourite", icon: "plus", onSelect: () => undefined },
                { label: "Settings", icon: "settings", onSelect: () => undefined },
                { label: "Hide chat", tone: "danger", onSelect: () => undefined },
              ]}
            />
          </>
        }
      >
        Ada Lovelace
      </ListRow>
    </Card>
  ),
};

/** Four ghost buttons in a row crowd it, and every one of them is a tab stop. */
export const DontOverflow: S = {
  render: () => (
    <Card flush>
      <ListRow
        size="sm"
        actions={
          <>
            <IconButton size="sm" variant="ghost" label="Reply" icon="chevron-right" />
            <IconButton size="sm" variant="ghost" label="Favourite" icon="plus" />
            <IconButton size="sm" variant="ghost" label="Settings" icon="settings" />
            <IconButton size="sm" variant="ghost" tone="danger" label="Hide chat" icon="close" />
          </>
        }
      >
        Ada Lovelace
      </ListRow>
    </Card>
  ),
};

/** The destructive item is last and `tone="danger"`, so the arrows never land on it first. */
export const DoDestructive: S = {
  render: () => (
    <Menu
      label="More actions"
      defaultOpen
      items={[
        { label: "Favourite", icon: "plus", onSelect: () => undefined },
        { label: "Settings", icon: "settings", onSelect: () => undefined },
        { label: "Hide chat", tone: "danger", onSelect: () => undefined },
      ]}
    />
  ),
};

/** A red item first is the one a quick Enter chooses. */
export const DontDestructive: S = {
  render: () => (
    <Menu
      label="More actions"
      defaultOpen
      items={[
        { label: "Hide chat", tone: "danger", onSelect: () => undefined },
        { label: "Favourite", icon: "plus", onSelect: () => undefined },
        { label: "Settings", icon: "settings", onSelect: () => undefined },
      ]}
    />
  ),
};

/** What the chosen action did, shown on the page, so the e2e can read it. */
function Chosen() {
  const [done, setDone] = useState("Nothing chosen yet");
  return (
    <div className="flex flex-col items-start gap-3 p-4">
      <Menu
        label="More actions"
        items={[
          { label: "Favourite", icon: "plus", onSelect: () => setDone("Favourited") },
          { label: "Archive", onSelect: () => setDone("Archived") },
          { label: "Hide chat", tone: "danger", onSelect: () => setDone("Hidden") },
        ]}
      />
      <Text>{done}</Text>
    </div>
  );
}

/** The closed overflow trigger: a ghost three-dot button named by `label`. */
export const Closed: S = { render: () => <Chosen /> };

/** The open menu: the first item has focus. */
export const Open: S = {
  render: () => (
    <>
      <Menu label="More actions" defaultOpen items={ROW_ACTIONS} />
    </>
  ),
};

/** `trigger="button"`: an outline button reading `label`, for a menu whose name is worth a word. */
export const ButtonTrigger: S = {
  render: () => (
    <>
      <Menu
        trigger="button"
        label="Export"
        defaultOpen
        items={[
          { label: "As CSV", onSelect: noop },
          { label: "As PDF", onSelect: noop },
        ]}
      />
    </>
  ),
};

/** Link items: an in-app path through the app's `LinkProvider`, and an `external` one in a new tab. */
export const Links: S = {
  render: () => (
    <LinkProvider link={FakeLink}>
      <>
        <Menu
          label="Go to"
          defaultOpen
          items={[
            { label: "Open chat", href: "/chats/42" },
            { label: "Settings", icon: "settings", href: "/settings" },
            { label: "Help", icon: "external-link", href: "https://example.com", external: true },
          ]}
        />
      </>
    </LinkProvider>
  ),
};

/** A `disabled` item is dimmed and the arrows skip it. */
export const DisabledItem: S = {
  render: () => (
    <>
      <Menu
        label="More actions"
        defaultOpen
        items={[
          { label: "Favourite", icon: "plus", onSelect: noop },
          { label: "Archive", disabled: true, onSelect: noop },
          { label: "Hide chat", tone: "danger", onSelect: noop },
        ]}
      />
    </>
  ),
};

/** In a `revealOnHover` row the actions stay shown while the menu is open. */
export const InRow: S = {
  render: () => (
    <div className="max-w-md">
      <Card flush>
        {["Rent", "Insurance"].map((name, index) => (
          <ListRow
            key={name}
            size="sm"
            revealOnHover
            divided={index > 0}
            trailing="R 1 850"
            actions={<Menu size="sm" label={`${name} actions`} items={ROW_ACTIONS} />}
          >
            {name}
          </ListRow>
        ))}
      </Card>
    </div>
  ),
};

function DialogWithMenu() {
  const [open, setOpen] = useState(true);
  const [done, setDone] = useState("Nothing chosen yet");
  return (
    <div className="p-6">
      <Button variant="outline" onClick={() => setOpen(true)}>
        Open
      </Button>
      {open && (
        <Dialog title="Chat with Ada" onClose={() => setOpen(false)}>
          <div className="flex items-center justify-between gap-3">
            <Text>{done}</Text>
            <Menu
              label="More actions"
              items={[
                { label: "Favourite", onSelect: () => setDone("Favourited") },
                { label: "Hide chat", tone: "danger", onSelect: () => setDone("Hidden") },
              ]}
            />
          </div>
        </Dialog>
      )}
    </div>
  );
}

/** A `Menu` in a modal `Dialog` opens inside the dialog, and Escape closes only the menu. */
export const InDialog: S = { render: () => <DialogWithMenu /> };
