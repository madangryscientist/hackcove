import type { Meta, StoryObj } from "@storybook/react-vite";
import { OutlineRegion, RegionFrame } from "@hackcove/ui";
import { sampleShot, sampleShotSize } from "./sampleShot";

const meta: Meta = { title: "UI/OutlineRegion" };
export default meta;
type S = StoryObj;

/** Regions over a screenshot: a plain outline, a labelled one and a hatched one for an area left out. */
export const Regions: S = {
  render: () => (
    <div className="max-w-xl">
      <RegionFrame src={sampleShot} alt="A screenshot of a dashboard">
        <OutlineRegion rect={{ x: 16, y: 40, width: 184, height: 22 }} within={sampleShotSize} />
        <OutlineRegion
          rect={{ x: 168, y: 112, width: 136, height: 72 }}
          within={sampleShotSize}
          label="manifest"
        />
        <OutlineRegion
          rect={{ x: 228, y: 4, width: 80, height: 20 }}
          within={sampleShotSize}
          label="UI"
          hatched
        />
      </RegionFrame>
    </div>
  ),
};

/** `rect` and `within` are in the picture's own pixels, so the box stays on its area however wide the picture is drawn. */
export const Scales: S = {
  render: () => (
    <div className="flex items-start gap-4">
      {["w-40", "w-80"].map((width) => (
        <div key={width} className={width}>
          <RegionFrame src={sampleShot} alt="">
            <OutlineRegion
              rect={{ x: 16, y: 112, width: 136, height: 72 }}
              within={sampleShotSize}
              label="config"
              hatched
            />
          </RegionFrame>
        </div>
      ))}
    </div>
  ),
};

/** A `label` says why the area is marked, so a reader can tell an ignored area from a flagged one. */
export const DoLabel: S = {
  render: () => (
    <RegionFrame src={sampleShot} alt="The dashboard">
      <OutlineRegion
        rect={{ x: 228, y: 4, width: 80, height: 20 }}
        within={sampleShotSize}
        label="ignored"
        hatched
      />
    </RegionFrame>
  ),
};

/** An unlabelled box leaves the reader to guess what it marks and where it came from. */
export const DontLabel: S = {
  render: () => (
    <RegionFrame src={sampleShot} alt="The dashboard">
      <OutlineRegion rect={{ x: 228, y: 4, width: 80, height: 20 }} within={sampleShotSize} />
    </RegionFrame>
  ),
};
