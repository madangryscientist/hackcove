import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, Cluster, Hero, Lead, Stack, Text } from "@hackcove/ui-react";
import { DemoShell, layoutPage } from "./DemoShell";

const meta: Meta = {
  title: "Layout/Hero",
  parameters: { layout: "fullscreen", bare: true },
  beforeEach: layoutPage,
};
export default meta;
type S = StoryObj;

/** A landing page's top block: the overline, the page's h1 and the lede, over the theme's glow. */
export const Landing: S = {
  render: () => (
    <DemoShell>
      <Stack gap="xl">
        <Hero overline="Products" title="Software we make, and the tools we make it with.">
          <Lead>
            A component library, a visual review tool and feature switches you can use today, and
            more on the way.
          </Lead>
        </Hero>
        <Text as="p">The page's first block starts here, a page gap under the hero.</Text>
      </Stack>
    </DemoShell>
  ),
};

/** The page's first actions go after the lede, inside the hero. */
export const WithActions: S = {
  render: () => (
    <DemoShell>
      <Hero overline="Hack Cove UI" title="Build the page with props, not CSS.">
        <Lead>Components and themes designed together, so a site looks right from the start.</Lead>
        <Cluster gap="sm">
          <Button>Get started</Button>
          <Button variant="outline">Browse components</Button>
        </Cluster>
      </Hero>
    </DemoShell>
  ),
};
