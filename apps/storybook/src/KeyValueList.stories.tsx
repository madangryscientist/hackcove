import type { Meta, StoryObj } from "@storybook/react-vite";
import { Cluster, Kbd, KeyValue, KeyValueList, Stack, Text } from "@hackcove/ui";

const meta: Meta = { title: "UI/KeyValueList" };
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
