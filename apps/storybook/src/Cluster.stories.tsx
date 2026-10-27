import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Body,
  BodyStrong,
  Button,
  ButtonGroup,
  Caption,
  Cluster,
  ClusterGrow,
  Input,
  Pill,
  Stack,
} from "@hackcove/ui";

const meta: Meta = { title: "UI/Cluster" };
export default meta;
type S = StoryObj;

/** A horizontal row a fixed gap apart: `xs` (the default), `sm` or `md`, the `Stack` scale. */
export const Default: S = {
  render: () => (
    <Stack>
      {(["xs", "sm", "md"] as const).map((gap) => (
        <Cluster key={gap} gap={gap}>
          <Caption>{gap}</Caption>
          <Pill>Draft</Pill>
          <Pill>Paid</Pill>
          <Pill>Overdue</Pill>
        </Cluster>
      ))}
    </Stack>
  ),
};

/** `ClusterGrow` marks the one child that takes the room left, so an input fills the row beside its buttons. */
export const GrowingInput: S = {
  render: () => (
    <Cluster>
      <ClusterGrow>
        <Input aria-label="Search" placeholder="Search invoices" />
      </ClusterGrow>
      <Button>Search</Button>
      <Button variant="outline">Clear</Button>
    </Cluster>
  ),
};

/** `justify` is the main axis: `start` (default), `between` pushes the first and last items to the two ends, `end`. */
export const Justify: S = {
  render: () => (
    <Stack>
      {(["start", "between", "end"] as const).map((justify) => (
        <Cluster key={justify} justify={justify}>
          <BodyStrong>Invoice 1042</BodyStrong>
          <Pill>{justify}</Pill>
        </Cluster>
      ))}
    </Stack>
  ),
};

/** An empty `ClusterGrow` is a spacer: what follows it goes to the end, whatever `justify` is. */
export const Spacer: S = {
  render: () => (
    <Cluster>
      <BodyStrong>Invoice 1042</BodyStrong>
      <ClusterGrow />
      <Button size="sm" variant="outline">
        Edit
      </Button>
      <Button size="sm" variant="outline" tone="danger">
        Remove
      </Button>
    </Cluster>
  ),
};

/** `align` is the cross axis: `center` (default), `baseline`, `start` or `end`. */
export const Align: S = {
  render: () => (
    <Stack>
      {(["center", "baseline", "start", "end"] as const).map((align) => (
        <Cluster key={align} align={align}>
          <Caption>{align}</Caption>
          <BodyStrong>Total</BodyStrong>
          <Input aria-label={`Amount (${align})`} defaultValue="1,240.00" width="md" />
        </Cluster>
      ))}
    </Stack>
  ),
};

/** With `wrap` the items flow onto further lines on a narrow viewport; without it the row stays on one line. */
export const Wraps: S = {
  render: () => (
    <div className="w-60">
      <Cluster wrap gap="xs">
        <Pill>Draft</Pill>
        <Pill>Sent</Pill>
        <Pill>Viewed</Pill>
        <Pill>Paid</Pill>
        <Pill>Overdue</Pill>
        <Pill>Void</Pill>
      </Cluster>
    </div>
  ),
};

/** `as="span"` is for a Cluster inside a paragraph, where a `div` is not allowed: the row sits on the paragraph's line. Its items must be phrasing content, so no `ClusterGrow`. */
export const InsideAParagraph: S = {
  render: () => (
    <Body as="p">
      <Cluster as="span" gap="xs">
        <Pill tone="emerald" dot>
          Paid
        </Pill>
        <Caption>12 Oct</Caption>
        <Caption>Invoice 1042</Caption>
      </Cluster>
    </Body>
  ),
};

/** The one item that should take the room left goes in `ClusterGrow`: the input fills the row and the buttons keep their size. */
export const DoFillRow: S = {
  render: () => (
    <Cluster>
      <ClusterGrow>
        <Input aria-label="Search" placeholder="Search invoices" />
      </ClusterGrow>
      <Button>Search</Button>
    </Cluster>
  ),
};

/** Without `ClusterGrow` the input keeps a fixed width and the rest of the row sits empty. Wrap the input in `ClusterGrow` instead. */
export const DontFillRow: S = {
  render: () => (
    <Cluster>
      <Input aria-label="Search" placeholder="Search invoices" width="sm" />
      <Button>Search</Button>
    </Cluster>
  ),
};

/** A row of buttons is a `ButtonGroup`: it wraps on a phone and can pin one item to the end. */
export const DoButtons: S = {
  render: () => (
    <ButtonGroup label="Invoice" end={<Button variant="outline">Back</Button>}>
      <Button>Send</Button>
      <Button variant="outline">Download</Button>
    </ButtonGroup>
  ),
};

/** `Cluster` is for every other row; a row of buttons in it does not wrap and has no end slot. */
export const DontButtons: S = {
  render: () => (
    <Cluster>
      <Button>Send</Button>
      <Button variant="outline">Download</Button>
      <Button variant="outline">Back</Button>
    </Cluster>
  ),
};

/** An empty `ClusterGrow` is a spacer: the title stays at the start and the actions go to the end. */
export const DoSpacer: S = {
  render: () => (
    <Cluster>
      <BodyStrong>Invoice 1042</BodyStrong>
      <ClusterGrow />
      <Button size="sm" variant="outline">
        Edit
      </Button>
      <Button size="sm" variant="outline" tone="danger">
        Remove
      </Button>
    </Cluster>
  ),
};

/** `justify="between"` spreads three items evenly, so the middle one floats away from the group it belongs to. */
export const DontSpacer: S = {
  render: () => (
    <Cluster justify="between">
      <BodyStrong>Invoice 1042</BodyStrong>
      <Button size="sm" variant="outline">
        Edit
      </Button>
      <Button size="sm" variant="outline" tone="danger">
        Remove
      </Button>
    </Cluster>
  ),
};
