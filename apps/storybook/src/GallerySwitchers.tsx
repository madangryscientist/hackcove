import { useState } from "react";
import { Body, SegmentedControl, Tabs } from "@hackcove/ui";

/** The in-place switchers of the Gallery: underline Tabs over a panel, and a SegmentedControl. */
export function GallerySwitchers() {
  const [tab, setTab] = useState("overview");
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
      <Body role="tabpanel">Showing {tab}.</Body>
      <SegmentedControl
        label="Range"
        items={[
          { value: "day", label: "Daily" },
          { value: "week", label: "Weekly" },
          { value: "dream", label: "Dream" },
        ]}
        value={range}
        onChange={setRange}
      />
    </div>
  );
}
