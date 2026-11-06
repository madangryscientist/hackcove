import type { Meta, StoryObj } from "@storybook/react-vite";
import { Cluster, Kbd, KeyValue, KeyValueList, Stack, Text } from "@hackcove/ui-react";

const meta: Meta = { title: "Content/KeyValueList" };
export default meta;
type S = StoryObj;

export const Facts: S = {
  render: () => (
    <div className="max-w-sm">
      <KeyValueList>
        <KeyValue label="Size">1280×720</KeyValue>
        <KeyValue label="Changed pixels">0.4%</KeyValue>
        <KeyValue label="Captured">2 min ago</KeyValue>
      </KeyValueList>
    </div>
  ),
};

export const WithKeys: S = {
  render: () => (
    <div className="max-w-sm">
      <KeyValueList>
        <KeyValue label="Next shot">
          <Kbd>j</Kbd>
        </KeyValue>
        <KeyValue label="Previous shot">
          <Kbd>k</Kbd>
        </KeyValue>
        <KeyValue label="Show these shortcuts">
          <Kbd>?</Kbd>
        </KeyValue>
      </KeyValueList>
    </div>
  ),
};

/** `align="start"`: the values sit left-aligned in one column beside the labels, which are as wide as the longest. */
export const ValuesAtStart: S = {
  render: () => (
    <div className="max-w-sm">
      <KeyValueList align="start">
        <KeyValue label="Size">1280×720</KeyValue>
        <KeyValue label="Changed pixels">0.4%</KeyValue>
        <KeyValue label="Captured">2 min ago</KeyValue>
      </KeyValueList>
    </div>
  ),
};

/** Label and value pairs are a `KeyValueList`: one row per fact, the label muted, the value in tabular figures. */
export const DoFactsList: S = {
  render: () => (
    <KeyValueList>
      <KeyValue label="Size">1280×720</KeyValue>
      <KeyValue label="Changed pixels">0.4%</KeyValue>
      <KeyValue label="Captured">2 min ago</KeyValue>
    </KeyValueList>
  ),
};

/** Rows built by hand from a `Cluster` and `Text` drift from the list's label colour and figures. Use `KeyValueList`. */
export const DontFactsList: S = {
  render: () => (
    <Stack gap="xs">
      <Cluster justify="between">
        <Text>Size</Text>
        <Text>1280×720</Text>
      </Cluster>
      <Cluster justify="between">
        <Text>Changed pixels</Text>
        <Text>0.4%</Text>
      </Cluster>
    </Stack>
  ),
};

/** `align="start"` puts the values in one left-aligned column, for long values or a mix of short and long ones. */
export const DoAlignStart: S = {
  render: () => (
    <KeyValueList align="start">
      <KeyValue label="Branch">hc-145-docs-for-every-export</KeyValue>
      <KeyValue label="Commit">83422a6</KeyValue>
      <KeyValue label="Captured">2 min ago</KeyValue>
    </KeyValueList>
  ),
};

/** `total` closes a column of amounts: a firm rule above it and strong text, for the sum the rows add up to. */
export const Total: S = {
  render: () => (
    <div className="max-w-sm">
      <KeyValueList>
        <KeyValue label="Salary">R 42 000</KeyValue>
        <KeyValue label="Rent">−R 9 500</KeyValue>
        <KeyValue label="Transport">−R 1 850</KeyValue>
        <KeyValue label="Left over" total>
          R 30 650
        </KeyValue>
      </KeyValueList>
    </div>
  ),
};

/** In an `align="start"` list the total keeps the shared label column. */
export const TotalAligned: S = {
  render: () => (
    <div className="max-w-sm">
      <KeyValueList align="start">
        <KeyValue label="Income">R 42 000</KeyValue>
        <KeyValue label="Costs">R 11 350</KeyValue>
        <KeyValue label="Net" total>
          R 30 650
        </KeyValue>
      </KeyValueList>
    </div>
  ),
};

/** `tone` colours the value: a total that does not reconcile is `total tone="warn"`. The rule and strong text stay; the figure says it too, with a sign or a word. */
export const TotalWarn: S = {
  render: () => (
    <div className="max-w-sm">
      <KeyValueList>
        <KeyValue label="Bank balance">R 31 200.00</KeyValue>
        <KeyValue label="Ledger balance">R 30 650.00</KeyValue>
        <KeyValue label="Unreconciled" total tone="warn">
          R 550.00 off
        </KeyValue>
      </KeyValueList>
    </div>
  ),
};

/** `tone` works on any row, not only a total: `positive` for a gain, `danger` for an overspend, `warn` for a figure to check. */
export const Tones: S = {
  render: () => (
    <div className="max-w-sm">
      <KeyValueList>
        <KeyValue label="Income">R 42 000</KeyValue>
        <KeyValue label="Overspent" tone="danger">
          −R 1 200 over
        </KeyValue>
        <KeyValue label="Saved" tone="positive">
          +R 3 000
        </KeyValue>
        <KeyValue label="Pending" tone="warn">
          R 550 to check
        </KeyValue>
      </KeyValueList>
    </div>
  ),
};
