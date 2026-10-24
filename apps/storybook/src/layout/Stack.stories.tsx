import type { Meta, StoryObj } from "@storybook/react-vite";
import { Body, Button, Card, PageHeader, Section, Stack, SubsectionHeading } from "@hackcove/ui";
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
