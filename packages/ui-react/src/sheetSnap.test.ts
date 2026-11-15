import { describe, expect, it } from "vitest";
import { releaseVelocity, restingSnap, snapPx } from "./sheetSnap.js";

const HEIGHTS = [100, 300, 600];

describe("restingSnap", () => {
  it("rests at the nearest snap when released still", () => {
    expect(restingSnap(HEIGHTS, 180, 0, 0)).toBe(0);
    expect(restingSnap(HEIGHTS, 220, 0, 0)).toBe(1);
    expect(restingSnap(HEIGHTS, 500, 0, 0)).toBe(2);
  });

  it("gives a tie to the lower snap", () => {
    expect(restingSnap(HEIGHTS, 200, 0, 0)).toBe(0);
    expect(restingSnap(HEIGHTS, 450, 0, 2)).toBe(1);
  });

  it("steps up one on a short upward fling still nearest the first snap", () => {
    expect(restingSnap(HEIGHTS, 130, 0.8, 0)).toBe(1);
  });

  it("steps down one on a downward fling from the top", () => {
    expect(restingSnap(HEIGHTS, 560, -0.8, 2)).toBe(1);
  });

  it("lands a long drag on the same snap still and at a fling in its own direction", () => {
    expect(restingSnap(HEIGHTS, 590, 0, 0)).toBe(2);
    expect(restingSnap(HEIGHTS, 590, 2, 0)).toBe(2);
    expect(restingSnap(HEIGHTS, 110, 0, 2)).toBe(0);
    expect(restingSnap(HEIGHTS, 110, -2, 2)).toBe(0);
  });

  it("never flings past the first or the last snap", () => {
    expect(restingSnap(HEIGHTS, 600, 3, 2)).toBe(2);
    expect(restingSnap(HEIGHTS, 100, -3, 0)).toBe(0);
  });

  it("treats a slow release as no fling", () => {
    expect(restingSnap(HEIGHTS, 130, 0.4, 0)).toBe(0);
  });
});

describe("releaseVelocity", () => {
  it("is the last two samples' change in height over their change in time", () => {
    const samples = [
      { height: 100, t: 0 },
      { height: 140, t: 10 },
      { height: 200, t: 20 },
    ];
    expect(releaseVelocity(samples, 25)).toBe(6);
  });

  it("is 0 when the pointer stopped more than 100ms before the release", () => {
    const samples = [
      { height: 100, t: 0 },
      { height: 200, t: 20 },
    ];
    expect(releaseVelocity(samples, 121)).toBe(0);
  });

  it("is 0 with one sample", () => {
    expect(releaseVelocity([{ height: 100, t: 0 }], 5)).toBe(0);
  });
});

describe("snapPx", () => {
  it("reads a share of the parent and pixels, held at the parent's height", () => {
    expect(snapPx(0.25, 800)).toBe(200);
    expect(snapPx("120px", 800)).toBe(120);
    expect(snapPx("900px", 800)).toBe(800);
  });

  it("holds nothing back against a parent with no height", () => {
    expect(snapPx("120px", 0)).toBe(120);
  });
});
