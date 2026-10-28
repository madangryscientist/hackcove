import type { Meta, StoryObj } from "@storybook/react-vite";
import { Card, Container, Text } from "@hackcove/ui";

/** The docs examples for `Container`. */
const meta: Meta = { title: "Docs/Container" };
export default meta;
type S = StoryObj;

/** One `Container` is the content edge: everything inside it starts at the same x. */
export const DoOneEdge: S = {
  render: () => (
    <Container as="section" aria-label="Billing">
      <Card title="Plan">
        <Text>Team, billed monthly.</Text>
      </Card>
    </Container>
  ),
};

/** A `Container` inside a `Container` pads the content twice, so it no longer lines up with the page. `AppShell` already wraps its main in one. */
export const DontOneEdge: S = {
  render: () => (
    <Container as="section" aria-label="Billing">
      <Container>
        <Card title="Plan">
          <Text>Team, billed monthly.</Text>
        </Card>
      </Container>
    </Container>
  ),
};
