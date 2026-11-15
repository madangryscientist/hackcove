// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { announcedPercent, ProgressBar, sharePercent } from "./ProgressBar.js";
import { render, screen } from "./render.harness.js";

const valueOf = (bar: HTMLElement) => bar.getAttribute("aria-valuenow");

describe("ProgressBar", () => {
  it("is a named progressbar with its percentage as the value", () => {
    render(<ProgressBar value={40} label="Kitchen funded" />);
    const bar = screen.getByRole("progressbar", { name: "Kitchen funded" });
    expect(bar.getAttribute("aria-valuemin")).toBe("0");
    expect(bar.getAttribute("aria-valuemax")).toBe("100");
    expect(valueOf(bar)).toBe("40");
  });

  it("measures against max", () => {
    render(<ProgressBar value={3} max={12} label="x" />);
    expect(valueOf(screen.getByRole("progressbar"))).toBe("25");
  });

  it("holds the value between 0 and 100", () => {
    render(
      <>
        <ProgressBar value={250} label="over" />
        <ProgressBar value={-5} label="under" />
        <ProgressBar value={5} max={0} label="no total" />
      </>,
    );
    expect(valueOf(screen.getByRole("progressbar", { name: "over" }))).toBe("100");
    expect(valueOf(screen.getByRole("progressbar", { name: "under" }))).toBe("0");
    expect(valueOf(screen.getByRole("progressbar", { name: "no total" }))).toBe("0");
  });
});

describe("percentages", () => {
  it("draws the exact share but announces a whole percent", () => {
    expect(sharePercent(1, 3)).toBeCloseTo(33.33, 1);
    expect(announcedPercent(1, 3)).toBe(33);
    expect(announcedPercent(2, 3)).toBe(67);
  });

  it("never rounds to a full or empty bar that is not", () => {
    expect(announcedPercent(995, 1000)).toBe(99);
    expect(announcedPercent(1, 1000)).toBe(1);
    expect(announcedPercent(1000, 1000)).toBe(100);
    expect(announcedPercent(0, 1000)).toBe(0);
    expect(sharePercent(996, 1000)).toBeCloseTo(99.6, 5);
  });

  it("announces the rounded share on the bar", () => {
    render(<ProgressBar value={996} max={1000} label="x" />);
    expect(valueOf(screen.getByRole("progressbar"))).toBe("99");
  });
});
