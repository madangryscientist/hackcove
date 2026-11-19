import type { Meta, StoryObj } from "@storybook/react-vite";
import { BulletItem, BulletList, Stack, Text } from "@slashsuite/ui-react";

const meta: Meta = { title: "Text/BulletList" };
export default meta;
type S = StoryObj;

export const Plain: S = {
  render: () => (
    <div className="max-w-xl">
      <BulletList>
        <BulletItem>Moved the nightly build from cron to a queue.</BulletItem>
        <BulletItem>Cut the cold start from nine seconds to two.</BulletItem>
        <BulletItem>Wrote the runbook the team still uses.</BulletItem>
      </BulletList>
    </div>
  ),
};

export const WithBody: S = {
  render: () => (
    <div className="max-w-xl">
      <BulletList>
        <BulletItem>Each item is a BulletItem, in the body text.</BulletItem>
        <BulletItem>The list owns the discs, indent and gap.</BulletItem>
      </BulletList>
    </div>
  ),
};

/** `ordered`: a numbered list, for steps a reader follows in order. */
export const Ordered: S = {
  render: () => (
    <div className="max-w-xl">
      <BulletList ordered>
        <BulletItem>Install the CLI.</BulletItem>
        <BulletItem>Add a token to the CI secrets.</BulletItem>
        <BulletItem>Run the first capture.</BulletItem>
      </BulletList>
    </div>
  ),
};

/** A list is a `BulletList` of `BulletItem`s: the list owns the discs, the indent and the gap. */
export const DoItems: S = {
  render: () => (
    <BulletList>
      <BulletItem>Moved the nightly build from cron to a queue.</BulletItem>
      <BulletItem>Cut the cold start from nine seconds to two.</BulletItem>
      <BulletItem>Wrote the runbook the team still uses.</BulletItem>
    </BulletList>
  ),
};

/** Hyphens typed into paragraphs are not a list: no discs, no indent and no list for a screen reader. */
export const DontItems: S = {
  render: () => (
    <Stack gap="xs">
      <Text>- Moved the nightly build from cron to a queue.</Text>
      <Text>- Cut the cold start from nine seconds to two.</Text>
      <Text>- Wrote the runbook the team still uses.</Text>
    </Stack>
  ),
};
