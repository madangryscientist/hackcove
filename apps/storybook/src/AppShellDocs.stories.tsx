import type { Meta, StoryObj } from "@storybook/react-vite";
import { Avatar, AppShellBrand, Cluster, TextLink } from "@hackcove/ui";

/**
 * The docs examples for `AppShell`. The shell is a whole page (`min-h-dvh`, a sticky header), so
 * the examples show its brand slot, the part that is small enough to put beside the text; the
 * full shell is the `Layout/AppShell` stories.
 */
const meta: Meta = { title: "Docs/AppShell" };
export default meta;
type S = StoryObj;

/** `AppShellBrand` makes the logo and the label one link, so the whole brand is the way home; `collapse` leaves only the logo below `sm`. */
export const DoBrand: S = {
  render: () => (
    <AppShellBrand href="#" logo={<Avatar name="Quotes" size="sm" />} label="Quotes" collapse />
  ),
};

/** A logo and a name as two separate links are two targets, and the logo link has no name. Put both in `AppShellBrand`. */
export const DontBrand: S = {
  render: () => (
    <Cluster gap="xs">
      <a href="#">
        <Avatar name="Quotes" size="sm" />
      </a>
      <TextLink href="#">Quotes</TextLink>
    </Cluster>
  ),
};

/** With a router, `render` draws the app's own link and `AppShellBrand` adds the logo, the label and the focus ring (here a stand-in `<a>`). */
export const DoRouterBrand: S = {
  render: () => (
    <AppShellBrand
      logo={<Avatar name="Quotes" size="sm" />}
      label="Quotes"
      render={(props) => <a {...props} href="#home" />}
    />
  ),
};
