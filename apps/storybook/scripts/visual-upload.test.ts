import { describe, expect, it } from "vitest";
import {
  baselineFailure,
  buildIn,
  decideUpload,
  readBuild,
  settle,
  shasOf,
  uploadSummaryLine,
  uploadTotalLine,
  type GroupResult,
  type BuildState,
  type UploadState,
} from "./visual-upload.js";

const tip = "a".repeat(40);
const other = "b".repeat(40);
const state = (over: Partial<UploadState> = {}): UploadState => ({
  branch: "hc-252",
  head: other,
  tip,
  mergeBase: tip,
  dirty: false,
  ...over,
});

describe("decideUpload", () => {
  it("uploads a clean branch on origin/main's tip as the branch", () => {
    expect(decideUpload(state())).toBe("branch");
  });

  it("uploads a clean HEAD at origin/main's tip as main, on main or detached", () => {
    expect(decideUpload(state({ branch: "main", head: tip }))).toBe("main");
    expect(decideUpload(state({ branch: "", head: tip }))).toBe("main");
  });

  it("refuses any other commit on main", () => {
    expect(() => decideUpload(state({ branch: "main", head: other }))).toThrow(
      /not at origin\/main's tip/,
    );
  });

  it("refuses a dirty tree, in either mode", () => {
    expect(() => decideUpload(state({ dirty: true }))).toThrow(/uncommitted/);
    expect(() => decideUpload(state({ branch: "", head: tip, dirty: true }))).toThrow(
      /uncommitted/,
    );
  });

  it("refuses a branch that is not on origin/main's tip", () => {
    expect(() => decideUpload(state({ mergeBase: other }))).toThrow(/rebase/);
  });
});

describe("baselineFailure", () => {
  const ancestors = new Set(["c1", "c2"]);
  const listings: Record<string, string[] | undefined> = {
    "hackcove-ui-text": ["m9", "m8"],
    "hackcove-ui-layout": ["m9", "c2"],
    "hackcove-ui-empty": [],
    "hackcove-ui-gone": undefined,
  };
  const deps = {
    mainShas: async (project: string) => listings[project],
    isAncestor: async (sha: string) => ancestors.has(sha),
  };

  it("passes when a main build is an ancestor of the merge-base", async () => {
    expect(await baselineFailure(["hackcove-ui-layout"], deps)).toBeUndefined();
  });

  it("passes the merge-base itself, which is its own ancestor", async () => {
    const own = { ...deps, isAncestor: async (sha: string) => sha === "m9" };
    expect(await baselineFailure(["hackcove-ui-text"], own)).toBeUndefined();
  });

  it("fails naming the project and the main-mode command when no listed sha is an ancestor", async () => {
    const failure = await baselineFailure(["hackcove-ui-layout", "hackcove-ui-text"], deps);
    expect(failure).toContain("hackcove-ui-text");
    expect(failure).not.toContain("hackcove-ui-layout");
    expect(failure).toContain("upload main first");
    expect(failure).toContain("bunx moon run storybook:visual-upload");
    expect(failure).toContain("origin/main");
  });

  it("fails a project with no main build at all", async () => {
    expect(await baselineFailure(["hackcove-ui-empty"], deps)).toContain("hackcove-ui-empty");
  });

  it("names a project the server refused as missing from the server", async () => {
    const failure = await baselineFailure(["hackcove-ui-gone"], deps);
    expect(failure).toContain("hackcove-ui-gone");
    expect(failure).toContain("pixelslash project create");
  });
});

describe("shasOf", () => {
  it("reads the commit_sha of each build, in order", () => {
    expect(
      shasOf({ builds: [{ commit_sha: "x" }, { id: "no sha" }, { commit_sha: "y" }] }),
    ).toEqual(["x", "y"]);
    expect(shasOf({})).toEqual([]);
  });

  it("leaves out a build that errored or has not finished, which is no baseline", () => {
    expect(
      shasOf({
        builds: [
          { commit_sha: "e", status: "errored" },
          { commit_sha: "p", status: "processing" },
          { commit_sha: "u", status: "uploading" },
          { commit_sha: "ok", status: "passed" },
        ],
      }),
    ).toEqual(["ok"]);
    expect(shasOf(null)).toEqual([]);
  });
});

const reply = (over: Record<string, unknown> = {}, counts: Record<string, unknown> = {}) => ({
  api_version: 1,
  build: {
    id: "22daf058",
    status: "changes",
    error: null,
    web_url: "http://pixelslash.test/projects/p/builds/22daf058",
    counts: {
      changed: 2,
      new: 1,
      removed: 3,
      unchanged: 40,
      rebaseline: 0,
      unmeasured: 0,
      pending: 0,
      accepted: 0,
      rejected: 0,
      to_review: 3,
      against_main: { changed: 0, new: 6 },
      skipped_flaky: 0,
      ...counts,
    },
    ...over,
  },
});

describe("readBuild", () => {
  it("reads the counts the totals line is made of, and the build page", () => {
    expect(readBuild(reply())).toEqual({
      id: "22daf058",
      status: "changes",
      error: "",
      url: "http://pixelslash.test/projects/p/builds/22daf058",
      counts: {
        changed: 2,
        unchanged: 40,
        new: 1,
        removed: 3,
        againstMain: { changed: 0, new: 6 },
        toReview: 3,
      },
    });
  });

  it("reads a build whose counts have no against_main as before", () => {
    const counts = { against_main: undefined, to_review: undefined };
    expect(readBuild(reply({}, counts))?.counts).toEqual({
      changed: 2,
      unchanged: 40,
      new: 1,
      removed: 3,
    });
  });

  it("is undefined for a reply that is not a build or lacks a count", () => {
    expect(readBuild({ error: "nope" })).toBeUndefined();
    expect(readBuild(reply({}, { removed: undefined }))).toBeUndefined();
    expect(readBuild(reply({ id: 7 }))).toBeUndefined();
  });
});

const build = (status: string, pending: number, error = ""): BuildState => {
  const read = readBuild(reply({ status, error: error || null }, { pending }));
  if (read === undefined) throw new Error("fixture is not a build");
  return read;
};

const run = async (steps: BuildState[], timeoutMs = 300_000) => {
  let clock = 0;
  let reads = 0;
  const result = await settle("22daf058", {
    read: async () => {
      const step = steps[Math.min(reads++, steps.length - 1)];
      if (step === undefined) throw new Error("no step");
      return step;
    },
    sleep: async (ms) => {
      clock += ms;
    },
    now: () => clock,
    timeoutMs,
    intervalMs: 3000,
  });
  return { result, reads };
};

describe("buildIn", () => {
  it("finds the build by id in a builds listing", () => {
    const unrelated = reply({ id: "other" }).build;
    const listing = { builds: [unrelated, reply().build] };
    expect(buildIn(listing, "22daf058")?.counts).toEqual({
      changed: 2,
      unchanged: 40,
      new: 1,
      removed: 3,
      againstMain: { changed: 0, new: 6 },
      toReview: 3,
    });
    expect(buildIn(listing, "missing")).toBeUndefined();
    expect(buildIn({}, "22daf058")).toBeUndefined();
  });
});

describe("settle", () => {
  it("polls until the build leaves processing", async () => {
    const { result, reads } = await run([
      build("uploading", 0),
      build("processing", 0),
      build("changes", 0),
    ]);
    expect(reads).toBe(3);
    expect(result.counts).toEqual({
      changed: 2,
      unchanged: 40,
      new: 1,
      removed: 3,
      againstMain: { changed: 0, new: 6 },
      toReview: 3,
    });
  });

  it("does not wait for a human: shots pending review do not hold a finished build", async () => {
    const { reads } = await run([build("passed", 171)]);
    expect(reads).toBe(1);
  });

  it("does not take a status it does not know for done", async () => {
    await expect(run([build("queued", 0)], 9000)).rejects.toThrow(/still queued/);
  });

  it("fails naming the build when it is still processing at the timeout", async () => {
    await expect(run([build("processing", 0)], 9000)).rejects.toThrow(
      /build 22daf058 was still processing/,
    );
  });

  it("fails naming the build when the server errored it", async () => {
    await expect(run([build("errored", 0, "shot too large")])).rejects.toThrow(
      /build 22daf058 errored.*shot too large/,
    );
  });
});

const group = (over: Partial<GroupResult["counts"]> = {}): GroupResult => ({
  counts: {
    changed: 0,
    unchanged: 75,
    new: 0,
    removed: 0,
    againstMain: { changed: 0, new: 6 },
    toReview: 6,
    ...over,
  },
  status: "changes",
  where: "http://ps.test/b/1",
});

describe("the upload summary lines", () => {
  it("reports a branch upload against main, not against its earlier upload", () => {
    const line = uploadSummaryLine("layout", group(), "branch");
    expect(line).toBe(
      "layout: against main: 0 changed, 6 new; 6 to review; changes; http://ps.test/b/1",
    );
    expect(uploadSummaryLine("layout", group({ unchanged: 3, changed: 2, new: 1 }), "branch")).toBe(
      line,
    );
  });

  it("prints a group without against_main, a main upload and a local compare as before", () => {
    const plain = group({ changed: 2, new: 1 });
    const bare = { ...plain, counts: { changed: 2, unchanged: 75, new: 1, removed: 0 } };
    const old = "layout: 2 changed, 75 unchanged, 1 new, 0 removed; http://ps.test/b/1";
    expect(uploadSummaryLine("layout", bare, "branch")).toBe(old);
    expect(uploadSummaryLine("layout", plain, "main")).toBe(old);
    expect(uploadSummaryLine("layout", plain, null)).toBe(old);
  });

  it("sums the against-main counts over the groups of a branch upload", () => {
    const second = group({ againstMain: { changed: 7, new: 1 }, toReview: 8 });
    expect(uploadTotalLine([group(), second], "branch")).toBe(
      "total: against main: 7 changed, 7 new; 14 to review",
    );
    const bare = { counts: { changed: 2, unchanged: 5, new: 0, removed: 0 }, where: "x" };
    expect(uploadTotalLine([group(), bare], "branch")).toBe(
      "total: against main: 0 changed, 6 new; 6 to review",
    );
  });

  it("sums the four counts for a main upload and a local compare", () => {
    const bare = { counts: { changed: 2, unchanged: 5, new: 1, removed: 4 }, where: "x" };
    expect(uploadTotalLine([bare, bare], "main")).toBe(
      "total: 4 changed, 10 unchanged, 2 new, 8 removed",
    );
    expect(uploadTotalLine([bare], null)).toBe("total: 2 changed, 5 unchanged, 1 new, 4 removed");
  });
});
