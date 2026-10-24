import { ProgressBar, SplitBar, StatTile, type BarTone } from "@hackcove/ui";

const tones: BarTone[] = ["accent", "positive", "warn", "negative"];

/** The StatTile, ProgressBar and SplitBar rows of the Gallery. */
export function GalleryBars() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile label="Debt-free" value="Mar 2029" />
        <StatTile label="Left over" value="R 4 250" hint="after all bills" tone="positive" accent />
        <StatTile label="Total interest" value="R 12 400" tone="negative" accent />
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
    </div>
  );
}
