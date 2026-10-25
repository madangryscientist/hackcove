import type { Meta, StoryObj } from "@storybook/react-vite";
import { Kbd, KeyValue, KeyValueList } from "@hackcove/ui";

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
