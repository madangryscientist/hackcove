import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  AppShellBrand,
  Avatar,
  Body,
  Card,
  Code,
  ColourSchemeToggle,
  NavTabs,
  PageHeader,
  Select,
  Stack,
} from "@hackcove/ui";
import { DemoShell, layoutPage } from "./DemoShell";

/** Every story under `Layout/` is picked up by the no-jump e2e (e2e/layout.spec.ts) at 375, 768 and 1280. */
const meta: Meta = {
  title: "Layout/AppShell",
  parameters: { bare: true },
  beforeEach: layoutPage,
};
export default meta;
type S = StoryObj;

const subnav = (
  <NavTabs
    label="Project"
    items={["Latest", "Branches", "Baselines", "Flaky", "Ignore boxes", "Audit"].map(
      (label, i) => ({
        label,
        href: `#${label}`,
        active: i === 0,
      }),
    )}
  />
);

/** Taller than the viewport: the header stays put while main scrolls. */
export const LongPage: S = {
  render: () => (
    <DemoShell subnav={subnav} footer="Hack Cove · MIT">
      <PageHeader title="Builds" subtitle="Every build of every branch." />
      <Stack>
        {Array.from({ length: 12 }, (_, i) => (
          <Card key={i} title={`Build ${12 - i}`}>
            <Body>Captured 48 stories in 4 themes.</Body>
          </Card>
        ))}
      </Stack>
    </DemoShell>
  ),
};

/** Shorter than the viewport: the title starts at the same x as on the long page. */
export const ShortPage: S = {
  render: () => (
    <DemoShell>
      <PageHeader title="About" />
      <Body as="p">One short paragraph.</Body>
    </DemoShell>
  ),
};

/**
 * The page canvas and the type face come from the theme: switch the toolbar theme and the page
 * behind the card, the card that lifts off it and the sans and mono faces all follow, with no CSS in
 * the app.
 */
export const ThemeCanvas: S = {
  render: () => (
    <DemoShell>
      <PageHeader title="Canvas" subtitle="The page behind the cards." />
      <Card title="On the canvas">
        <Body as="p">
          Body text in the theme's sans face, and <Code>mono_in_the_theme_face</Code> beside it.
        </Body>
      </Card>
    </DemoShell>
  ),
};

const personal = [
  "Overview",
  "Tasks",
  "Inbox",
  "Calendar",
  "Budget",
  "Habits",
  "Notes",
  "Reading",
  "Travel",
  "Health",
  "Journal",
  "Settings",
];

/**
 * A subnav of twelve links, far wider than a phone. At 375 px (Phone in the viewport toolbar) the
 * row fades out on the side that still has links; scroll it to the end and that fade goes.
 */
export const OverflowingSubnav: S = {
  render: () => (
    <DemoShell
      subnav={
        <NavTabs
          label="Personal"
          items={personal.map((label, i) => ({ label, href: `#${label}`, active: i === 0 }))}
        />
      }
    >
      <PageHeader title="Personal" subtitle="The subnav scrolls sideways." />
    </DemoShell>
  ),
};

/**
 * The three header slots, none with a wrapper or `className` from the app: `brand` is the logo and
 * name at the brand type with the logo gap, `nav` is a `NavTabs`, and `controls` sits at the end of
 * the row, gap-2 and vertically centred. No child of `controls` shrinks, and the `Select` at its
 * default `width="full"` sizes to its content, so the toggle keeps its square.
 */
export const HeaderSlots: S = {
  render: () => (
    <DemoShell
      controls={
        <>
          <Select aria-label="Adviser" defaultValue="a">
            <option value="a">Ada Lovelace</option>
            <option value="b">Grace Hopper</option>
          </Select>
          <ColourSchemeToggle />
        </>
      }
    >
      <PageHeader title="Header slots" subtitle="Brand, nav and controls." />
    </DemoShell>
  ),
};

/** `AppShellBrand`: a logo and a label inside one link, so the whole brand is the way home. */
export const LinkedBrand: S = {
  render: () => (
    <DemoShell
      brand={<AppShellBrand href="#" logo={<Avatar name="Quotes" size="sm" />} label="Quotes" />}
    >
      <PageHeader title="Linked brand" subtitle="Logo and label are one link." />
    </DemoShell>
  ),
};

const squareLogo = (
  <svg viewBox="0 0 20 20" fill="currentColor">
    <rect x="2" y="2" width="16" height="16" rx="4" />
  </svg>
);

/** `logoSize`: `sm` (20px), `md` (24px, the default) and `lg` (32px); an `<img>` or `<svg>` logo fills the box. */
export const LogoSizes: S = {
  render: () => (
    <DemoShell brand={<AppShellBrand href="#" logoSize="sm" logo={squareLogo} label="Quotes" />}>
      <PageHeader title="Logo sizes" subtitle="sm in the header; sm, md and lg below." />
      <Stack>
        {(["sm", "md", "lg"] as const).map((size) => (
          <AppShellBrand
            key={size}
            href="#"
            logoSize={size}
            logo={squareLogo}
            label={`Quotes, ${size}`}
          />
        ))}
      </Stack>
    </DemoShell>
  ),
};

/** `collapse`: below the `sm` breakpoint only the logo shows; the label is visually hidden and still names the link. Narrow the viewport to see it. */
export const CollapsedBrand: S = {
  render: () => (
    <DemoShell
      brand={
        <AppShellBrand href="#" logo={<Avatar name="Quotes" size="sm" />} label="Quotes" collapse />
      }
    >
      <PageHeader title="Collapsed brand" subtitle="Logo only below sm." />
    </DemoShell>
  ),
};

/** The same brand drawn by the app's own router link, through `render` (here a stand-in `<a>`). */
export const RouterBrand: S = {
  render: () => (
    <DemoShell
      brand={
        <AppShellBrand
          logo={<Avatar name="Quotes" size="sm" />}
          label="Quotes"
          render={(props) => <a {...props} href="#router" data-router="/" />}
        />
      }
    >
      <PageHeader title="Router brand" subtitle="Drawn by render, no href of its own." />
    </DemoShell>
  ),
};

/**
 * `hideChromeInPrint`: on screen nothing changes. On paper the header and footer are gone and main
 * has no padding, so the page margin is `@page`'s. Try it with Print preview, or emulate print media.
 */
export const HiddenInPrint: S = {
  render: () => (
    <DemoShell footer="Hack Cove · MIT" hideChromeInPrint>
      <PageHeader title="Printed page" subtitle="Only this prints." />
      <Body as="p">The header and footer above and below are hidden in print.</Body>
    </DemoShell>
  ),
};
