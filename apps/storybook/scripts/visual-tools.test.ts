import { describe, expect, it } from "vitest";
import {
  PortTaken,
  VisualError,
  bindFailed,
  captureWorkers,
  parallelFrom,
  stepFailure,
  withFreePort,
} from "./visual-tools.js";

describe("stepFailure", () => {
  it("names the signal when the step was killed by one", () => {
    expect(stepFailure("bun run pixelslash", "/work/app", "SIGTERM")).toBe(
      "`bun run pixelslash` killed by SIGTERM in /work/app",
    );
    expect(stepFailure("bun run pixelslash", "/work/app", "SIGTERM")).toContain("SIGTERM");
  });

  it("keeps the plain message for an ordinary non-zero exit", () => {
    expect(stepFailure("bunx nx build storybook", "/work/base", null)).toBe(
      "`bunx nx build storybook` failed in /work/base",
    );
    expect(stepFailure("bunx nx build storybook", "/work/base", undefined)).toBe(
      "`bunx nx build storybook` failed in /work/base",
    );
  });
});

describe("withFreePort", () => {
  it("picks another port when the first is taken before the capture binds it", async () => {
    const picks = [5000, 5001];
    const used: number[] = [];
    const result = await withFreePort(
      async (port) => {
        used.push(port);
        if (port === 5000) throw new PortTaken(port);
        return "captured";
      },
      async () => picks.shift() ?? 0,
      3,
    );
    expect(result).toBe("captured");
    expect(used).toEqual([5000, 5001]);
    expect(new Set(used).size).toBe(2);
  });

  it("gives two groups started at the same moment different ports", async () => {
    // Both pick 5000 at once; whichever binds second finds it taken and takes the next one.
    const picks = [5000, 5000, 5001, 5002];
    const bound = new Set<number>();
    const attempt = async (port: number) => {
      await Promise.resolve();
      if (bound.has(port)) throw new PortTaken(port);
      bound.add(port);
      return port;
    };
    const ports = await Promise.all([
      withFreePort(attempt, async () => picks.shift() ?? 0, 3),
      withFreePort(attempt, async () => picks.shift() ?? 0, 3),
    ]);
    expect(new Set(ports).size).toBe(2);
  });

  it("fails naming the port after the last try", async () => {
    const picks = [5000, 5001, 5002, 5003];
    let tries = 0;
    await expect(
      withFreePort(
        async (port) => {
          tries++;
          throw new PortTaken(port);
        },
        async () => picks.shift() ?? 0,
        3,
      ),
    ).rejects.toThrow("port 5000, 5001, 5002 was taken on each of 3 tries");
    expect(tries).toBe(3);
  });

  it("does not retry any other failure", async () => {
    let tries = 0;
    await expect(
      withFreePort(
        async () => {
          tries++;
          throw new VisualError("capture failed");
        },
        async () => 5000,
        3,
      ),
    ).rejects.toThrow("capture failed");
    expect(tries).toBe(1);
  });
});

describe("bindFailed", () => {
  it("reads a taken port from the capture's output", () => {
    // Bun's own wording when `e2e/serve.ts` cannot bind.
    expect(
      bindFailed('error: Failed to start server. Is port 6008 in use?\n code: "EADDRINUSE"'),
    ).toBe(true);
    expect(bindFailed("error: page crashed")).toBe(false);
  });
});

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
