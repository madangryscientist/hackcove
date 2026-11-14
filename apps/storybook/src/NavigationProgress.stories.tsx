import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import {
  AppShell,
  AppShellBrand,
  Button,
  NavigationProgress,
  PageFade,
  ProgressBar,
  Stack,
  Tabs,
  Text,
} from "@hackcove/ui-react";

const meta: Meta = { title: "Feedback/NavigationProgress", parameters: { layout: "fullscreen" } };
export default meta;
type S = StoryObj<{ active: boolean }>;

/**
 * The bar in its shown state, fixed to the top edge of the viewport and over the AppShell header.
 * It draws what `active` says; the stylesheet holds it invisible for the first 150ms.
 * A real app passes the router's pending flag; here it is a story arg.
 */
export const Default: S = {
  parameters: { bare: true },
  args: { active: true },
  render: ({ active }) => (
    <>
      <NavigationProgress active={active} />
      <AppShell
        brand={<AppShellBrand href="#" label="Quotes" />}
        nav={
          <Tabs
            variant="pill"
            label="Main"
            items={[
              { label: "Home", href: "#", active: true },
              { label: "Stores", href: "#stores" },
              { label: "Events", href: "#events" },
            ]}
          />
        }
      >
        <Text as="p">The page the reader is leaving. The bar runs along the very top.</Text>
      </AppShell>
    </>
  ),
};

/** Pass `active` from the router's pending state: the bar shows while it is true and is gone when the page has arrived. */
export const DoPending: S = {
  render: () => {
    const [pending, setPending] = useState(true);
    return (
      <Stack gap="sm">
        <NavigationProgress active={pending} />
        <Button variant="outline" onClick={() => setPending(!pending)}>
          {pending ? "The page has arrived" : "Open the store page"}
        </Button>
        <PageFade>
          <Text>{pending ? "Waiting for the next page." : "The current page."}</Text>
        </PageFade>
      </Stack>
    );
  },
};

/** A `ProgressBar` needs a value, and a page load has none to give: a guessed one sits still or lies about how far along it is. */
export const DontPending: S = {
  render: () => (
    <Stack gap="sm">
      <ProgressBar value={60} label="Loading page" />
      <Text>Waiting for the next page.</Text>
    </Stack>
  ),
};
