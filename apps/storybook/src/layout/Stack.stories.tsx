import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Body,
  Button,
  Card,
  Field,
  Input,
  PageHeader,
  Section,
  Stack,
  SubsectionHeading,
} from "@hackcove/ui";
import { DemoShell, layoutPage } from "./DemoShell";

const meta: Meta = {
  title: "Layout/Stack",
  parameters: { bare: true },
  beforeEach: layoutPage,
};
export default meta;
type S = StoryObj;

/** `lg` between the Sections, `sm` inside each; a bare Stack is `md`. */
export const StackAndSection: S = {
  render: () => (
    <DemoShell>
      <PageHeader
        title="Project"
        subtitle="Stack gaps: sm inside a group, md between blocks, lg between groups."
      />
      <Stack gap="lg">
        <Section title="Recent builds" actions={<Button variant="outline">All builds</Button>}>
          <Card>
            <Body>Build 412 · 3 changed</Body>
          </Card>
          <Card>
            <Body>Build 411 · 0 changed</Body>
          </Card>
        </Section>
        <Section title="Members">
          <Stack>
            <Card>
              <Body>md gap between these two cards.</Body>
            </Card>
            <Card>
              <Body>Second card.</Body>
            </Card>
          </Stack>
        </Section>
      </Stack>
    </DemoShell>
  ),
};

/** `section` (`gap-12`, `sm:gap-16`) between a page's top-level blocks: one page rhythm, no per-block `pb-*`. */
export const SectionGap: S = {
  render: () => (
    <DemoShell>
      <Stack gap="section">
        <PageHeader title="Page" subtitle="Stack gap section: the step between a page's blocks." />
        <Section title="Intro">
          <Body as="p">First block of the page.</Body>
        </Section>
        <Section title="Details">
          <Card>
            <Body>Second block.</Body>
          </Card>
        </Section>
        <Section title="Contact">
          <Body as="p">Third block.</Body>
        </Section>
      </Stack>
    </DemoShell>
  ),
};

/** `xs` (8px) between lines of text, so a heading, the line under it and a paragraph take no `mt-*`. */
export const TextBlock: S = {
  render: () => (
    <DemoShell>
      <PageHeader title="Team" subtitle="Stack gap xs: the step between lines of one text block." />
      <Stack gap="xs">
        <SubsectionHeading>Jacobus Langner</SubsectionHeading>
        <Body color="tertiary">Founder</Body>
        <Body as="p">Builds the Hack Cove design system and the sites that use it.</Body>
      </Stack>
    </DemoShell>
  ),
};

/** `width` caps the column and keeps it at the left edge: `narrow` (`max-w-3xl`), `default` (none), `wide` (`max-w-5xl`), `full`. */
export const Widths: S = {
  render: () => (
    <DemoShell>
      <PageHeader
        title="Widths"
        subtitle="Each Stack starts at the title's x; none is re-centred."
      />
      <Stack gap="lg">
        {(["narrow", "default", "wide", "full"] as const).map((width) => (
          <Stack key={width} width={width}>
            <Card>
              <Body>width="{width}"</Body>
            </Card>
          </Stack>
        ))}
      </Stack>
    </DemoShell>
  ),
};

/** `as="form"` is a `<form>` that spaces its fields: `onSubmit`, `action`, `method` and the other form props go on it. */
export const AsForm: S = {
  render: () => (
    <DemoShell>
      <PageHeader
        title="Form"
        subtitle='Stack as="form": the fields are spaced, the submit is yours.'
      />
      <Stack
        as="form"
        width="narrow"
        aria-label="Invite a member"
        onSubmit={(event) => event.preventDefault()}
      >
        <Field label="Name" htmlFor="stack-form-name">
          <Input id="stack-form-name" />
        </Field>
        <Field label="Email" htmlFor="stack-form-email">
          <Input id="stack-form-email" type="email" />
        </Field>
        <Button type="submit">Invite</Button>
      </Stack>
    </DemoShell>
  ),
};

/** `as="ul"` and `as="ol"` draw a list with no markers; the children are `<li>`s, which Stack does not wrap. */
export const AsList: S = {
  render: () => (
    <DemoShell>
      <PageHeader
        title="Lists"
        subtitle='Stack as="ul" and as="ol": a spaced list, children are li.'
      />
      <Stack gap="lg" width="narrow">
        <Stack as="ul" gap="sm" aria-label="Builds">
          <li>
            <Card>
              <Body>Build 412 · 3 changed</Body>
            </Card>
          </li>
          <li>
            <Card>
              <Body>Build 411 · 0 changed</Body>
            </Card>
          </li>
        </Stack>
        <Stack as="ol" gap="sm" aria-label="Steps">
          <li>
            <Body>1. Install the package.</Body>
          </li>
          <li>
            <Body>2. Import the theme.</Body>
          </li>
        </Stack>
      </Stack>
    </DemoShell>
  ),
};
