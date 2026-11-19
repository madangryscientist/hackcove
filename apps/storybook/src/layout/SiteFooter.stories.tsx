import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  AppShell,
  Caption,
  MetaList,
  SiteFooter,
  Stack,
  Text,
  TextLink,
} from "@slashsuite/ui-react";

/** The footer a site puts in `AppShell`'s `footer` slot. */
const meta: Meta = { title: "Layout/SiteFooter", parameters: { layout: "fullscreen" } };
export default meta;
type S = StoryObj;

/** A brand linked home with the contact line beside it, the site's links, then the fine print, in the shell's footer. */
export const Default: S = {
  render: () => (
    <AppShell
      footer={
        <SiteFooter
          brand="PixelSlash"
          brandLabel="PixelSlash home"
          links={[
            { label: "Privacy", href: "#privacy" },
            { label: "Terms", href: "#terms" },
            { label: "GitHub", href: "https://github.com", external: true },
          ]}
          notes={["MIT licence.", "PixelSlash is a Hack Cove product."]}
        >
          <Text>Email hello@example.com</Text>
        </SiteFooter>
      }
    >
      <Text>The page.</Text>
    </AppShell>
  ),
};

/** A site's footer is a `SiteFooter` in `AppShell`'s `footer` slot: the shell draws the one footer landmark around it. */
export const DoFooter: S = {
  render: () => (
    <SiteFooter
      links={[
        { label: "Privacy", href: "/privacy" },
        { label: "Terms", href: "/terms" },
      ]}
      notes={["Hack Cove (Pty) Ltd"]}
    >
      <Text>Email hello@example.com</Text>
    </SiteFooter>
  ),
};

/** A footer built from a `Stack` of `Caption`s and a `MetaList` by hand drifts from every other site's. */
export const DontFooter: S = {
  render: () => (
    <Stack gap="xs">
      <Text>Email hello@example.com</Text>
      <MetaList>
        <TextLink href="/privacy">Privacy</TextLink>
        <TextLink href="/terms">Terms</TextLink>
      </MetaList>
      <Caption>Hack Cove (Pty) Ltd</Caption>
    </Stack>
  ),
};
