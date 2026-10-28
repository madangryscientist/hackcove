import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, ButtonGroup } from "@hackcove/ui";

const meta: Meta = { title: "UI/ButtonGroup" };
export default meta;
type S = StoryObj;

/** A `ButtonGroup` spaces and wraps its buttons, and `end` pushes one item to the far side. */
export const DoRow: S = {
  render: () => (
    <ButtonGroup
      label="Quote actions"
      end={
        <Button href="#quotes" variant="ghost">
          Back
        </Button>
      }
    >
      <Button>Save</Button>
      <Button variant="outline">Preview</Button>
    </ButtonGroup>
  ),
};

/** Buttons loose in a div have no gap, do not wrap as one row, and the group has no name. */
export const DontRow: S = {
  render: () => (
    <div>
      <Button>Save</Button>
      <Button variant="outline">Preview</Button>
      <Button href="#quotes" variant="ghost">
        Back
      </Button>
    </div>
  ),
};

export const Default: S = {
  render: () => (
    <ButtonGroup label="Quote actions">
      <Button>Save</Button>
      <Button variant="outline">Preview</Button>
      <Button variant="outline" tone="danger">
        Discard
      </Button>
    </ButtonGroup>
  ),
};

/** `end` sits at the far side of the row. */
export const WithEnd: S = {
  render: () => (
    <ButtonGroup
      label="Quote actions"
      end={
        <Button href="#" variant="ghost">
          Back
        </Button>
      }
    >
      <Button>Save</Button>
      <Button variant="outline">Preview</Button>
    </ButtonGroup>
  ),
};

/** On a narrow viewport the row wraps and `end` stays at the end of the last line. */
export const Wraps: S = {
  render: () => (
    <div className="w-60">
      <ButtonGroup
        end={
          <Button href="#" variant="ghost">
            Back
          </Button>
        }
      >
        <Button>Save</Button>
        <Button variant="outline">Preview</Button>
        <Button variant="outline">Duplicate</Button>
      </ButtonGroup>
    </div>
  ),
};

export const Compact: S = {
  render: () => (
    <ButtonGroup label="Row actions">
      <Button size="sm" variant="outline">
        Edit
      </Button>
      <Button size="sm" variant="outline" tone="danger">
        Remove
      </Button>
    </ButtonGroup>
  ),
};
