import type { Meta, StoryObj } from "@storybook/react-vite";
import { Pill, Timeline, TimelineItem } from "@hackcove/ui";

const meta: Meta = { title: "UI/Timeline" };
export default meta;
type S = StoryObj;

export const StatusHistory: S = {
  render: () => (
    <div className="max-w-md">
      <Timeline label="Status history">
        <TimelineItem title={<Pill tone="emerald">accepted</Pill>} time="12 Oct 2026, 09:14">
          Client confirmed by phone.
        </TimelineItem>
        <TimelineItem title={<Pill tone="amber">sent</Pill>} time="10 Oct 2026, 16:02" />
        <TimelineItem title={<Pill tone="slate">draft</Pill>} time="10 Oct 2026, 15:40">
          Created from the intake form.
        </TimelineItem>
      </Timeline>
    </div>
  ),
};

export const Empty: S = {
  render: () => (
    <div className="max-w-md">
      <Timeline
        label="Status history"
        empty={<p className="text-sm text-slate-500">No history yet.</p>}
      />
    </div>
  ),
};
