import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Button,
  Card,
  ClusterGrow,
  Input,
  Overline,
  SideColumn,
  Stack,
  Text,
} from "@hackcove/ui-react";

/** A main area beside a fixed-width side column from `lg`; the aside stacks under the main area below it. */
const meta: Meta = { title: "Layout/SideColumn", parameters: { layout: "padded" } };
export default meta;
type S = StoryObj;

const thread = (
  <Card title="Thread">
    <Stack gap="sm">
      <Text as="p">Naledi: Can you move the debit order to the 25th?</Text>
      <Text as="p">You: Done, it starts next month.</Text>
      <Input aria-label="Reply" placeholder="Write a reply" />
    </Stack>
  </Card>
);

const agent = (
  <Card title="Reply agent">
    <Stack gap="sm">
      <Text as="p" tone="muted">
        Ask for a draft, then edit it before it is sent.
      </Text>
      <Button variant="outline">Suggest a reply</Button>
    </Stack>
  </Card>
);

/** From `lg` the aside is `md` wide (24rem, the default) and `children` take the room left. */
export const Default: S = {
  render: () => (
    <SideColumn aside={agent}>
      <Stack gap="sm">{thread}</Stack>
    </SideColumn>
  ),
};

/** `asideWidth` is `sm` (18rem) or `md` (24rem, the default). */
export const Widths: S = {
  render: () => (
    <Stack>
      {(["sm", "md"] as const).map((width) => (
        <SideColumn
          key={width}
          asideWidth={width}
          aside={
            <Card title={`asideWidth ${width}`}>
              <Text as="p">{width === "sm" ? "18rem" : "24rem"}</Text>
            </Card>
          }
        >
          <Card title="Main">
            <Text as="p">Takes the room left.</Text>
          </Card>
        </SideColumn>
      ))}
    </Stack>
  ),
};

/**
 * `asideLabel` folds the aside behind a disclosure of that name, closed, below `lg`, so the main
 * area comes first on a phone. From `lg` it is the same column, always shown, with no toggle. The
 * aside stays mounted while folded.
 */
export const FoldedAside: S = {
  render: () => (
    <SideColumn aside={agent} asideLabel="Ask the reply agent">
      <Stack gap="sm">{thread}</Stack>
    </SideColumn>
  ),
};

/** A main area and a side column of a known width are a `SideColumn`: the aside is exactly as wide as `asideWidth`, whatever it holds. */
export const DoFixedColumn: S = {
  render: () => (
    <SideColumn
      aside={
        <Card title="Reply agent">
          <Text as="p">Ask for a draft, then edit it before it is sent.</Text>
        </Card>
      }
    >
      <Card title="Thread">
        <Text as="p">The main area takes everything the aside leaves.</Text>
      </Card>
    </SideColumn>
  ),
};

/** A `Stack` with `rowFrom` and a `ClusterGrow` sizes the side by its content: a long line makes it wide and takes the room from the main area. */
export const DontFixedColumn: S = {
  render: () => (
    <Stack rowFrom="lg">
      <ClusterGrow>
        <Card title="Thread">
          <Text as="p">The main area takes what is left.</Text>
        </Card>
      </ClusterGrow>
      <Card>
        <Overline>Reply agent</Overline>
        <Text as="p">
          Whatever width the aside's text wants is the width it takes, so it changes with its words.
        </Text>
      </Card>
    </Stack>
  ),
};
