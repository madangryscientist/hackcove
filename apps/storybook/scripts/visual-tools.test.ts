import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  PortTaken,
  VisualError,
  baseBuildCommand,
  bindFailed,
  outsideMoon,
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
    expect(stepFailure("bunx moon run storybook:build", "/work/base", null)).toBe(
      "`bunx moon run storybook:build` failed in /work/base",
    );
    expect(stepFailure("bunx moon run storybook:build", "/work/base", undefined)).toBe(
      "`bunx moon run storybook:build` failed in /work/base",
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

/** A scratch checkout, with or without a moon workspace. */
function checkout(withMoon: boolean): string {
  const dir = mkdtempSync(join(tmpdir(), "visual-base-"));
  if (withMoon) {
    mkdirSync(join(dir, ".moon"));
    writeFileSync(join(dir, ".moon", "workspace.yml"), "projects: {}\n");
  }
  return dir;
}

describe("baseBuildCommand", () => {
  it("builds with moon when the base commit has a moon workspace", () => {
    const dir = checkout(true);
    try {
      expect(baseBuildCommand(dir)).toEqual(["bunx", "moon", "run", "storybook:build"]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("builds with Nx when the base commit predates the move to moon", () => {
    const dir = checkout(false);
    try {
      expect(baseBuildCommand(dir)).toEqual(["bunx", "nx", "build", "storybook"]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("outsideMoon", () => {
  it("drops what moon and proto hand a task, so a moon run in the base finds the base's workspace", () => {
    const env = {
      PATH: "/usr/bin",
      HOME: "/home/me",
      MOON_WORKSPACE_ROOT: "/work/branch",
      MOON_CACHE_DIR: "/work/branch/.moon/cache",
      PROTO_VERSION: "0.62.2",
      UNSET: undefined,
    };
    expect(outsideMoon(env)).toEqual({ PATH: "/usr/bin", HOME: "/home/me" });
  });
});
