import {
  Legend,
  ProgressBar,
  SplitBar,
  StackedBar,
  StatTile,
  TrendChart,
  type BarTone,
  type StackedSegment,
} from "@hackcove/ui-react";

const tones: BarTone[] = ["accent", "positive", "warn", "negative"];

const buildMix: StackedSegment[] = [
  { label: "Changed", value: 24, tone: "warn" },
  { label: "New", value: 9, tone: "info" },
  { label: "Removed", value: 4, tone: "danger" },
  { label: "Unmeasured", value: 31, tone: "neutral" },
  { label: "Same", value: 132, tone: "muted" },
];

const snapshot: StackedSegment[] = [
  { label: "Changed", value: 24, tone: "warn" },
  { label: "New", value: 9, tone: "info" },
  { label: "Removed", value: 4, tone: "danger" },
  { label: "Same", value: 163, tone: "muted" },
];

const weeks = Array.from({ length: 12 }, (_, i) => `W${i + 1}`);

/** The StatTile, ProgressBar, SplitBar, StackedBar, Legend and TrendChart rows of the Gallery. */
export function GalleryBars() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile label="Debt-free" value="Mar 2029" />
        <StatTile label="Left over" value="R 4 250" hint="after all bills" tone="positive" accent />
        <StatTile label="Total interest" value="R 12 400" tone="negative" accent />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile label="Pending" value="R 3 200" hint="2 not cleared" tone="warn" accent />
        <StatTile
          label="Closed this week"
          value="16"
          hint="up from 13"
          trend={[4, 7, 3, 9, 12, 8, 6, 11, 14, 9, 13, 16]}
        />
      </div>
      <div className="flex flex-col gap-2">
        {tones.map((tone, i) => (
          <ProgressBar key={tone} value={25 * (i + 1)} tone={tone} label={`${tone} progress`} />
        ))}
        <ProgressBar value={45} size="lg" label="Thicker progress" />
      </div>
      <div className="flex flex-col gap-2">
        <SplitBar a={35} b={65} label="Pot split" />
        <SplitBar a={50} b={50} toneA="accent" toneB="warn" size="sm" label="Accent and warn" />
      </div>
      <div className="flex flex-col gap-2">
        <StackedBar segments={snapshot} label="Screenshots by status" legend />
        <StackedBar segments={snapshot} size="sm" label="Thin screenshots by status" />
        <Legend items={snapshot.map(({ label, tone }) => ({ label, tone }))} />
        <StackedBar segments={buildMix} label="Build by status" legend />
        <Legend
          items={[
            { label: "Current", tone: "violet" },
            { label: "Snapshot", tone: "violet", swatch: "dashed" },
            { label: "Unmeasured", tone: "neutral", swatch: "dashed" },
          ]}
        />
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <TrendChart
          label="Tickets opened and closed per week"
          buckets={weeks}
          series={[
            { label: "Opened", tone: "warn", values: [6, 5, 8, 7, 9, 10, 7, 9, 8, 11, 10, 9] },
            { label: "Closed", tone: "info", values: [4, 7, 3, 9, 12, 8, 6, 11, 14, 9, 13, 16] },
          ]}
        />
        <TrendChart
          label="Open tickets at the end of each week"
          kind="line"
          buckets={weeks}
          series={[
            {
              label: "Open",
              tone: "violet",
              values: [32, 30, 35, 33, 30, 32, 33, 31, 25, 27, 24, 17],
            },
          ]}
        />
      </div>
    </div>
  );
}
