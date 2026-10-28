import type { Meta, StoryObj } from "@storybook/react-vite";
import { BulletList, Stack, Text } from "@hackcove/ui";

const meta: Meta = { title: "UI/BulletList" };
export default meta;
type S = StoryObj;

export const Plain: S = {
  render: () => (
    <div className="max-w-xl">
      <BulletList>
        <li>Moved the nightly build from cron to a queue.</li>
        <li>Cut the cold start from nine seconds to two.</li>
        <li>Wrote the runbook the team still uses.</li>
      </BulletList>
    </div>
  ),
};

export const WithBody: S = {
  render: () => (
    <div className="max-w-xl">
      <BulletList>
        <Text as="li">Items set in Text, as the site does.</Text>
        <Text as="li">The list owns the discs, indent and gap.</Text>
      </BulletList>
    </div>
  ),
};

/** A list is a `BulletList` of `Text as="li"`: the list owns the discs, the indent and the gap. */
export const DoItems: S = {
  render: () => (
    <BulletList>
      <Text as="li">Moved the nightly build from cron to a queue.</Text>
      <Text as="li">Cut the cold start from nine seconds to two.</Text>
      <Text as="li">Wrote the runbook the team still uses.</Text>
    </BulletList>
  ),
};

/** Hyphens typed into paragraphs are not a list: no discs, no indent and no list for a screen reader. */
export const DontItems: S = {
  render: () => (
    <Stack gap="xs">
      <Text as="p">- Moved the nightly build from cron to a queue.</Text>
      <Text as="p">- Cut the cold start from nine seconds to two.</Text>
      <Text as="p">- Wrote the runbook the team still uses.</Text>
    </Stack>
  ),
};
