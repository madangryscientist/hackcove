import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Body,
  Display,
  Lead,
  PageHeading,
  SectionHeading,
  Stack,
  SubsectionHeading,
} from "@hackcove/ui";

const meta: Meta = { title: "UI/Headings" };
export default meta;
type S = StoryObj;

/** One `PageHeading` names the page, `SectionHeading` its parts and `SubsectionHeading` what is inside a part. */
export const DoScale: S = {
  render: () => (
    <Stack gap="sm">
      <PageHeading>Quotes</PageHeading>
      <SectionHeading rule>Open</SectionHeading>
      <SubsectionHeading>Awaiting reply</SubsectionHeading>
      <Body as="p">Three quotes are waiting on the customer.</Body>
    </Stack>
  ),
};

/** `PageHeading` is an `h1`, and a page has one. A second one for a section breaks the outline: use `SectionHeading`. */
export const DontScale: S = {
  render: () => (
    <Stack gap="sm">
      <PageHeading>Quotes</PageHeading>
      <Body as="p">Three quotes are waiting on the customer.</Body>
      <PageHeading>Open</PageHeading>
      <Body as="p">Two quotes are open.</Body>
    </Stack>
  ),
};

/** `truncate` cuts a `SubsectionHeading` that is too long for its column to one line with an ellipsis, and keeps the full text as its tooltip. */
export const Truncated: S = {
  render: () => (
    <div className="w-60">
      <SubsectionHeading truncate>
        Awaiting a reply from the customer about the revised scope
      </SubsectionHeading>
    </div>
  ),
};

/** `Display` is the one headline at the top of a public page, with a `Lead` under it. */
export const DoHero: S = {
  render: () => (
    <Stack gap="xs">
      <Display>Tools for people who build</Display>
      <Lead>The supporting sentence that sits under the headline.</Lead>
    </Stack>
  ),
};

/** `Display` is marketing scale, not a section title: inside a page it dwarfs everything around it. Use `SectionHeading`. */
export const DontHero: S = {
  render: () => (
    <Stack gap="sm">
      <PageHeading>Dashboard</PageHeading>
      <Display as="h2">Recent activity</Display>
      <Body as="p">Nothing has changed since yesterday.</Body>
    </Stack>
  ),
};
