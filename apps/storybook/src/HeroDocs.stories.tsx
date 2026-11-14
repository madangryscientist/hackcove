import type { Meta, StoryObj } from "@storybook/react-vite";
import { Display, Hero, Lead, Overline, PageHeader, Stack } from "@hackcove/ui-react";

/** The docs examples for `Hero`. */
const meta: Meta = { title: "Layout/Hero" };
export default meta;
type S = StoryObj;

/** A landing page opens with one `Hero`: the overline, the title and the lede, over the theme's glow. */
export const DoLanding: S = {
  render: () => (
    <Hero overline="Products" title="Software we make.">
      <Lead>A component library and the tools we build it with.</Lead>
    </Hero>
  ),
};

/** An overline, a `Display` and a `Lead` put together by hand drift from the one top block, and have no glow. Use `Hero`. */
export const DontLanding: S = {
  render: () => (
    <Stack gap="sm" width="narrow">
      <header>
        <Overline mono>Products</Overline>
        <Display>Software we make.</Display>
      </header>
      <Lead>A component library and the tools we build it with.</Lead>
    </Stack>
  ),
};

/** Every page past the landing page opens with a `PageHeader`: one hero per site's front door. */
export const DoInnerPage: S = {
  render: () => <PageHeader title="Members" subtitle="Who can see this project." />,
};

/** A `Hero` on an inner page shouts over the content it heads. Use `PageHeader`. */
export const DontInnerPage: S = {
  render: () => (
    <Hero title="Members">
      <Lead>Who can see this project.</Lead>
    </Hero>
  ),
};
