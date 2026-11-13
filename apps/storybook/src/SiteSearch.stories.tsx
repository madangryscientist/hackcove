import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Cluster,
  ColourSchemeToggle,
  Icon,
  Input,
  ListRow,
  SiteSearch,
  Stack,
  type SiteSearchItem,
} from "@hackcove/ui-react";

const meta: Meta = { title: "Navigation/SiteSearch" };
export default meta;
type S = StoryObj;

/** A docs site's pages, in its rail order. */
const pages: SiteSearchItem[] = [
  { label: "Button", description: "The one main action.", href: "#button" },
  { label: "Dialog", description: "A modal on the browser's own dialog.", href: "#dialog" },
  {
    label: "FieldDialog",
    description: "A dialog with one field and a submit.",
    href: "#field-dialog",
  },
  { label: "Drawer", description: "A panel that slides in from the side.", href: "#drawer" },
  { label: "Tabs", description: "Switch a view in place.", href: "#tabs" },
  {
    label: "Breadcrumbs",
    description: "Where this page sits in the hierarchy.",
    href: "#breadcrumbs",
  },
  { label: "Input", description: "A text field.", href: "#input", keywords: ["SearchInput"] },
];

/** The trigger on its own: from `sm` up, Search and its key; below, the search icon. Ctrl+K opens it. */
export const Default: S = {
  render: () => (
    <div className="p-6">
      <SiteSearch items={pages} label="Search components" />
    </div>
  ),
};

/** Open, with "dia" typed: Dialog first (its name starts with it), then FieldDialog. */
export const Open: S = {
  render: () => (
    <div className="p-6">
      <SiteSearch items={pages} label="Search components" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const trigger = [...canvasElement.querySelectorAll("button")].find(
      (button) => button.offsetParent !== null,
    );
    trigger?.click();
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
    const field = document.querySelector<HTMLInputElement>("dialog input");
    if (!field) return;
    Reflect.set(HTMLInputElement.prototype, "value", "dia", field);
    field.dispatchEvent(new Event("input", { bubbles: true }));
  },
};

/** `SiteSearch` in the header's `controls`, beside the colour toggle, given every page: one search, on every page, with a shortcut. */
export const DoHeader: S = {
  render: () => (
    <Cluster gap="sm">
      <SiteSearch
        label="Search components"
        items={[
          { label: "Dialog", description: "A modal window.", href: "#dialog" },
          { label: "Tabs", description: "Switch a view in place.", href: "#tabs" },
        ]}
      />
      <ColourSchemeToggle size="sm" store={false} />
    </Cluster>
  ),
};

/** A field and a hand-filtered list in the page body is a second search with no shortcut, no keys and no count read out. Use `SiteSearch`. */
export const DontHeader: S = {
  render: () => (
    <Stack gap="sm">
      <Input type="search" aria-label="Filter" icon={<Icon name="search" />} defaultValue="dia" />
      <div>
        <ListRow href="#dialog" size="sm">
          Dialog
        </ListRow>
        <ListRow href="#field-dialog" size="sm" divided>
          FieldDialog
        </ListRow>
      </div>
    </Stack>
  ),
};
