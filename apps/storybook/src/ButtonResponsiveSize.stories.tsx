import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, ButtonGroup, IconButton, SegmentedControl } from "@hackcove/ui-react";

const meta: Meta = { title: "Actions/Button" };
export default meta;
type S = StoryObj;

/**
 * `size={{ base: "md", md: "lg" }}`: `md` controls on a phone, `lg` from 48rem up, in CSS. Every
 * control in the row takes the same value, so the row stays aligned at both widths.
 */
export const ResponsiveSize: S = {
  render: () => (
    <ButtonGroup label="Item actions">
      <Button size={{ base: "md", md: "lg" }} icon="plus">
        Add photo
      </Button>
      <IconButton label="Settings" icon="settings" size={{ base: "md", md: "lg" }} />
      <SegmentedControl
        size={{ base: "md", md: "lg" }}
        label="Condition"
        items={[
          { value: "new", label: "New" },
          { value: "good", label: "Good" },
          { value: "worn", label: "Worn" },
        ]}
        value="good"
        onChange={() => undefined}
      />
    </ButtonGroup>
  ),
};
