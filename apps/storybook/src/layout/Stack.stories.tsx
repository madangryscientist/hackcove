import type { Meta, StoryObj } from "@storybook/react-vite";
import { Body, Button, Card, PageHeader, Section, Stack } from "@hackcove/ui";
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
