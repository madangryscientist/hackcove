import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button, PageFade, SegmentedControl, Stack, startPageTransition, Text } from "@hackcove/ui";

const meta: Meta = { title: "UI/PageFade" };
export default meta;
type S = StoryObj;

const pages = [
  { value: "overview", label: "Overview", text: "The overview page: a summary of the project." },
  { value: "activity", label: "Activity", text: "The activity page: what changed, and when." },
];

/**
 * The frame stays put and the content cross-fades. The route change stands in as a state change
 * wrapped in `startPageTransition`; a router's own view-transition option does the same job.
 * With `prefers-reduced-motion: reduce`, or in a browser without View Transitions, it just swaps.
 */
export const Default: S = {
  render: () => {
    const [value, setValue] = useState("overview");
    const page = pages.find((p) => p.value === value);
    return (
      <div className="flex max-w-xl flex-col gap-4">
        <SegmentedControl
          label="Page"
          items={pages}
          value={value}
          onChange={(next) => startPageTransition(() => setValue(next))}
        />
        <PageFade>
          <div className="flex flex-col gap-2 rounded-lg border border-slate-200 p-4">
            <Text as="p">{page?.label}</Text>
            <Text>{page?.text}</Text>
          </div>
        </PageFade>
      </div>
    );
  },
};

/** `PageFade` wraps only the content that changes between pages; the frame around it, with the control, stays put. */
export const DoChangingArea: S = {
  render: () => {
    const [value, setValue] = useState("overview");
    const items = [
      { value: "overview", label: "Overview" },
      { value: "activity", label: "Activity" },
    ];
    return (
      <Stack gap="sm">
        <SegmentedControl
          label="Page"
          items={items}
          value={value}
          onChange={(next) => startPageTransition(() => setValue(next))}
        />
        <PageFade>
          <Text>The {value} page.</Text>
        </PageFade>
      </Stack>
    );
  },
};

/** Wrapping the frame too makes the control fade with the content, so the page flickers instead of changing in place. */
export const DontChangingArea: S = {
  render: () => {
    const [value, setValue] = useState("overview");
    const items = [
      { value: "overview", label: "Overview" },
      { value: "activity", label: "Activity" },
    ];
    return (
      <PageFade>
        <Stack gap="sm">
          <SegmentedControl
            label="Page"
            items={items}
            value={value}
            onChange={(next) => startPageTransition(() => setValue(next))}
          />
          <Text>The {value} page.</Text>
        </Stack>
      </PageFade>
    );
  },
};

/** The change goes through `startPageTransition`, so the browser has the old and the new page to fade between. */
export const DoTransition: S = {
  render: () => {
    const [value, setValue] = useState("overview");
    return (
      <Stack gap="sm">
        <Button
          variant="outline"
          onClick={() =>
            startPageTransition(() => setValue(value === "overview" ? "activity" : "overview"))
          }
        >
          Switch page
        </Button>
        <PageFade>
          <Text>The {value} page.</Text>
        </PageFade>
      </Stack>
    );
  },
};

/** A plain state change swaps the content at once: there is no transition to fade. */
export const DontTransition: S = {
  render: () => {
    const [value, setValue] = useState("overview");
    return (
      <Stack gap="sm">
        <Button
          variant="outline"
          onClick={() => setValue(value === "overview" ? "activity" : "overview")}
        >
          Switch page
        </Button>
        <PageFade>
          <Text>The {value} page.</Text>
        </PageFade>
      </Stack>
    );
  },
};
