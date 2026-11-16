import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Avatar,
  AppShellBrand,
  LinkProvider,
  Cluster,
  Text,
  TextLink,
  Show,
} from "@hackcove/ui-react";

/**
 * The docs examples for `AppShell`. The shell is a whole page (`min-h-dvh`, a sticky header), so
 * the examples show its brand slot, the part that is small enough to put beside the text; the
 * full shell is the `Layout/AppShell` stories.
 */
const meta: Meta = { title: "Layout/AppShell" };
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

/** With a router, the app's `LinkProvider` draws the link and `AppShellBrand` adds the logo, the label and the focus ring (here a stand-in `<a>`). */
export const DoRouterBrand: S = {
  render: () => (
    <LinkProvider link={({ href, ...rest }) => <a {...rest} href={`#${href}`} />}>
      <AppShellBrand logo={<Avatar name="Quotes" size="sm" />} label="Quotes" href="/" />
    </LinkProvider>
  ),
};

/** A header control that only matters on a wide screen (who is signed in) goes in a `Show from="sm"`, with a `Cluster` inside to keep the avatar and the name together. Narrow the viewport to see it go. */
export const DoHideBelow: S = {
  render: () => (
    <Show from="sm">
      <Cluster gap="xs">
        <Avatar name="Ada Lovelace" size="sm" />
        <Text as="span">Ada Lovelace</Text>
      </Cluster>
    </Show>
  ),
};

/** Shown at every width, the name pushes the nav and the toggle off a phone's header row. */
export const DontHideBelow: S = {
  render: () => (
    <Cluster gap="xs">
      <Avatar name="Ada Lovelace" size="sm" />
      <Text>Ada Lovelace</Text>
    </Cluster>
  ),
};
