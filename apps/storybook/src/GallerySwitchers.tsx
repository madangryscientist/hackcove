import { useState } from "react";
import { SegmentedControl, Tabs, Text } from "@hackcove/ui";

/**
 * The in-place switchers of the Gallery: underline and pill Tabs (counts, a disabled tab) over a
 * panel, and a SegmentedControl with a count and a disabled option.
 */
export function GallerySwitchers() {
  const [tab, setTab] = useState("overview");
  const [asset, setAsset] = useState("shots");
  const [range, setRange] = useState("week");
  return (
    <div className="flex max-w-lg flex-col gap-4">
      <Tabs
        label="Project views"
        items={[
          { value: "overview", label: "Overview" },
          { value: "activity", label: "Activity" },
          { value: "settings", label: "Settings" },
        ]}
        value={tab}
        onChange={setTab}
      />
      <Text role="tabpanel">Showing {tab}.</Text>
      <Tabs
        variant="pill"
        label="Assets"
        items={[
          { value: "shots", label: "Shots", count: 12 },
          { value: "clips", label: "Clips", count: 3 },
          { value: "exports", label: "Exports", disabled: true, title: "Nothing exported yet" },
        ]}
        value={asset}
        onChange={setAsset}
      />
      <SegmentedControl
        label="Range"
        items={[
          { value: "day", label: "Daily" },
          { value: "week", label: "Weekly" },
          { value: "dream", label: "Dream", count: 2 },
          { value: "year", label: "Yearly", disabled: true, title: "Needs a year of data" },
        ]}
        value={range}
        onChange={setRange}
      />
    </div>
  );
}
