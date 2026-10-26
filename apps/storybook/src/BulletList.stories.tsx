import type { Meta, StoryObj } from "@storybook/react-vite";
import { Body, BulletList, Stack } from "@hackcove/ui";

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
        <Body as="li">Items set in Body, as the site does.</Body>
        <Body as="li">The list owns the discs, indent and gap.</Body>
      </BulletList>
    </div>
  ),
};

/** A list is a `BulletList` of `Body as="li"`: the list owns the discs, the indent and the gap. */
export const DoItems: S = {
  render: () => (
    <BulletList>
      <Body as="li">Moved the nightly build from cron to a queue.</Body>
      <Body as="li">Cut the cold start from nine seconds to two.</Body>
      <Body as="li">Wrote the runbook the team still uses.</Body>
    </BulletList>
  ),
};

/** Hyphens typed into paragraphs are not a list: no discs, no indent and no list for a screen reader. */
export const DontItems: S = {
  render: () => (
    <Stack gap="xs">
      <Body as="p">- Moved the nightly build from cron to a queue.</Body>
      <Body as="p">- Cut the cold start from nine seconds to two.</Body>
      <Body as="p">- Wrote the runbook the team still uses.</Body>
    </Stack>
  ),
};
