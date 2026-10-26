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

/** `tone` colours the marker dot with the Callout's set; the default `neutral` is a plain ring. */
export const Tones: S = {
  render: () => (
    <div className="max-w-md">
      <Timeline label="Renovation">
        <TimelineItem tone="positive" title="Paid" time="12 Oct 2026" />
        <TimelineItem tone="info" title="Booked" time="10 Oct 2026" />
        <TimelineItem tone="warn" title="Delayed" time="8 Oct 2026">
          Waiting on the tiles.
        </TimelineItem>
        <TimelineItem tone="danger" title="Rejected" time="5 Oct 2026" />
        <TimelineItem title="Planned" time="1 Oct 2026" />
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

/** A `title` (a Pill or a short label), the `time` already formatted for the reader, and a note under them. */
export const DoEvents: S = {
  render: () => (
    <Timeline label="Status history">
      <TimelineItem
        tone="positive"
        title={<Pill tone="emerald">accepted</Pill>}
        time="12 Oct 2026, 09:14"
      >
        Client confirmed by phone.
      </TimelineItem>
      <TimelineItem title={<Pill tone="amber">sent</Pill>} time="10 Oct 2026, 16:02" />
    </Timeline>
  ),
};

/** `time` is drawn as given: a raw ISO string reads as machine output. Format it before it gets here. */
export const DontEvents: S = {
  render: () => (
    <Timeline label="Status history">
      <TimelineItem title="accepted" time="2026-10-12T09:14:00.000Z">
        Client confirmed by phone.
      </TimelineItem>
      <TimelineItem title="sent" time="2026-10-10T16:02:00.000Z" />
    </Timeline>
  ),
};

/** With no items, `empty` is drawn in place of the list. */
export const DoNoEvents: S = {
  render: () => <Timeline label="Status history" empty="No history yet." />,
};
