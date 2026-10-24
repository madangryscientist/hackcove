import type { Meta, StoryObj } from "@storybook/react-vite";
import { Body, BulletList } from "@hackcove/ui";

const meta: Meta = { title: "UI/BulletList" };
export default meta;
type S = StoryObj;

export const Plain: S = {
  render: () => (
    <BulletList className="max-w-xl text-sm text-slate-600">
      <li>Moved the nightly build from cron to a queue.</li>
      <li>Cut the cold start from nine seconds to two.</li>
      <li>Wrote the runbook the team still uses.</li>
    </BulletList>
  ),
};

export const WithBody: S = {
  render: () => (
    <BulletList className="max-w-xl">
      <Body as="li">Items set in Body, as the site does.</Body>
      <Body as="li">The list owns the discs, indent and gap.</Body>
    </BulletList>
  ),
};
