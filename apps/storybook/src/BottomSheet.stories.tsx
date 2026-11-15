import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import {
  BottomSheet,
  Button,
  Cluster,
  ListRow,
  Pill,
  SectionHeading,
  Text,
} from "@hackcove/ui-react";

const meta: Meta = {
  title: "Feedback/BottomSheet",
  parameters: { layout: "fullscreen", bare: true },
};
export default meta;
type S = StoryObj;

const SNAPS = [0.25, 0.5, 0.9] as const;

const SHOPS = Array.from({ length: 20 }, (_, i) => ({
  name: `Shop ${i + 1}`,
  street: `${12 + i} Long Street`,
  km: (0.2 + i * 0.3).toFixed(1),
}));

const rows = (count: number) =>
  SHOPS.slice(0, count).map((shop, i) => (
    <ListRow key={shop.name} divided={i > 0} secondary={shop.street} trailing={`${shop.km} km`}>
      {shop.name}
    </ListRow>
  ));

/** The heading and the count, in `header`: they stay put while the list scrolls. */
const HEADER = (
  <>
    <SectionHeading>Shops nearby</SectionHeading>
    <Pill>20</Pill>
  </>
);

/**
 * A dummy full-screen view (a map) with pins that stay pressable behind the sheet, and the sheet in
 * the story's own state. The line at the top prints the snap and the height the sheet reported.
 */
function Shops({ start }: { start: number }) {
  const [snap, setSnap] = useState(start);
  const [height, setHeight] = useState<number | null>(null);
  const [pins, setPins] = useState(0);
  return (
    <div className="relative h-dvh overflow-hidden bg-slate-100">
      <div className="p-4">
        <Cluster>
          {["Pin A", "Pin B", "Pin C"].map((pin) => (
            <Button key={pin} variant="outline" size="sm" onClick={() => setPins((n) => n + 1)}>
              {pin}
            </Button>
          ))}
        </Cluster>
        <Text>
          Pins pressed: {pins}. Snap {snap + 1} of {SNAPS.length}
          {height === null ? "" : `, ${Math.round(height)}px`}.
        </Text>
      </div>
      <BottomSheet
        label="Shops"
        snaps={SNAPS}
        snap={snap}
        onSnapChange={setSnap}
        onHeightChange={setHeight}
        header={HEADER}
        footer={<Button>Show all on the map</Button>}
      >
        {rows(20)}
      </BottomSheet>
    </div>
  );
}

/** At its first snap over the view: the handle steps it up, a drag moves it, Escape brings it back. */
export const Default: S = { render: () => <Shops start={0} /> };

/** At its second snap: the list scrolls under the header, and the view behind is still pressable. */
export const Expanded: S = { render: () => <Shops start={1} /> };

/** The view followed by more page, so the document itself can scroll: a fling in the body must not move it. */
export const ScrollingPage: S = {
  render: () => (
    <>
      <Shops start={0} />
      <div className="flex flex-col gap-3 p-6">
        {Array.from({ length: 30 }, (_, i) => (
          <Text key={i}>Page content below the view, line {i + 1}.</Text>
        ))}
      </div>
    </>
  ),
};

/** The docs examples' stand-in for a full-screen view: the sheet's positioned parent. */
const docsView: S["decorators"] = [
  (Story) => (
    <div className="relative h-96 overflow-hidden bg-slate-100">
      <Story />
    </div>
  ),
];

/** The heading and the count go in `header`: they stay put while the list scrolls under them. */
export const DoHeader: S = {
  decorators: docsView,
  render: () => {
    const [snap, setSnap] = useState(1);
    return (
      <BottomSheet
        label="Shops"
        snaps={[0.3, 0.75]}
        snap={snap}
        onSnapChange={setSnap}
        header={
          <>
            <SectionHeading>Shops nearby</SectionHeading>
            <Pill>12</Pill>
          </>
        }
      >
        {Array.from({ length: 12 }, (_, i) => (
          <ListRow key={i} divided={i > 0} trailing={`${i + 2}00 m`}>
            Shop {i + 1}
          </ListRow>
        ))}
      </BottomSheet>
    );
  },
};

/** Do not put the heading first in the body: it scrolls away with the list. */
export const DontHeader: S = {
  decorators: docsView,
  render: () => {
    const [snap, setSnap] = useState(1);
    return (
      <BottomSheet label="Shops" snaps={[0.3, 0.75]} snap={snap} onSnapChange={setSnap}>
        <SectionHeading>Shops nearby</SectionHeading>
        {Array.from({ length: 12 }, (_, i) => (
          <ListRow key={i} divided={i > 0} trailing={`${i + 2}00 m`}>
            Shop {i + 1}
          </ListRow>
        ))}
      </BottomSheet>
    );
  },
};
