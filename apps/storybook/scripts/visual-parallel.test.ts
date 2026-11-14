import { describe, expect, it } from "vitest";
import { captureWorkers, eachAtOnce, parallelFrom } from "./visual-parallel.js";
import { VisualError } from "./visual-tools.js";

describe("parallelFrom", () => {
  it("defaults to one group", () => {
    expect(parallelFrom(undefined)).toBe(1);
    expect(parallelFrom("")).toBe(1);
  });

  it("reads a whole number", () => {
    expect(parallelFrom("3")).toBe(3);
  });

  it("refuses anything else", () => {
    for (const bad of ["0", "-1", "2.5", "three", "3x"])
      expect(() => parallelFrom(bad)).toThrow("VISUAL_PARALLEL");
  });
});

describe("captureWorkers", () => {
  it("gives PixelSlash's own count to a lone group", () => {
    expect(captureWorkers(1, 12)).toBe(10);
    expect(captureWorkers(1, 4)).toBe(4);
  });

  it("splits the CPUs between the groups", () => {
    expect(captureWorkers(3, 12)).toBe(4);
    expect(captureWorkers(3, 10)).toBe(3);
    expect(captureWorkers(2, 10)).toBe(5);
  });

  it("keeps groups times workers within the CPUs", () => {
    for (const cpus of [1, 2, 4, 10, 12, 32])
      for (let parallel = 1; parallel <= cpus; parallel++)
        expect(parallel * captureWorkers(parallel, cpus)).toBeLessThanOrEqual(cpus);
  });

  it("refuses more groups than CPUs", () => {
    expect(() => captureWorkers(4, 3)).toThrow("more than the 3 CPUs");
  });
});

/** A task that records the order items start in and the most that ran at once. */
function tracked() {
  const started: string[] = [];
  let running = 0;
  let most = 0;
  const task = async (item: string) => {
    started.push(item);
    running += 1;
    most = Math.max(most, running);
    await Promise.resolve();
    running -= 1;
  };
  return { task, started, most: () => most };
}

describe("eachAtOnce", () => {
  it("runs one item at a time, in order, when parallel is 1", async () => {
    const t = tracked();
    await eachAtOnce(["a", "b", "c"], 1, t.task);
    expect(t.started).toEqual(["a", "b", "c"]);
    expect(t.most()).toBe(1);
  });

  it("runs up to `parallel` items at once and never more", async () => {
    const t = tracked();
    await eachAtOnce(["a", "b", "c", "d", "e"], 3, t.task);
    expect(t.started).toEqual(["a", "b", "c", "d", "e"]);
    expect(t.most()).toBe(3);
  });

  it("runs the rest after a group fails, then fails naming the count", async () => {
    const ran: string[] = [];
    const run = eachAtOnce(["a", "b", "c"], 1, async (item) => {
      ran.push(item);
      if (item === "a") throw new VisualError("a: capture failed");
    });
    await expect(run).rejects.toThrow("1 of 3 groups failed");
    expect(ran).toEqual(["a", "b", "c"]);
  });

  it("throws a bug as it is, not as a group failure", async () => {
    const bug = new TypeError("not a visual error");
    const run = eachAtOnce(["a", "b"], 2, async (item) => {
      if (item === "b") throw bug;
    });
    await expect(run).rejects.toBe(bug);
  });
});
