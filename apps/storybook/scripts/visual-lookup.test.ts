import { describe, expect, it } from "vitest";
import { lookupFailure, lookupResult } from "./visual-lookup.js";

describe("lookupResult", () => {
  const listing = JSON.stringify({ builds: [] });

  it("parses the listing on exit 0", () => {
    expect(lookupResult(0, listing, "")).toEqual({ kind: "ok", listing: { builds: [] } });
  });

  it("reads exit 2, the CLI's usage error, as a missing project and keeps its line", () => {
    const stderr = "no project hackcove-ui-gone\nusage: pixelslash builds --project <name>\n";
    expect(lookupResult(2, "", stderr)).toEqual({
      kind: "missing",
      line: "no project hackcove-ui-gone",
    });
  });

  it("reads exit 3 with a 500 as a server failure, not a missing project", () => {
    const stderr = "GET /api/projects/hackcove-ui-text/builds -> 500 internal: boom\n";
    expect(lookupResult(3, "", stderr)).toEqual({
      kind: "failed",
      line: "GET /api/projects/hackcove-ui-text/builds -> 500 internal: boom",
    });
  });

  it("reads exit 3 with a 401 as a server failure", () => {
    const stderr = "GET /api/projects -> 401 unauthorized; run `pixelslash login --server x`\n";
    expect(lookupResult(3, "", stderr)).toMatchObject({
      kind: "failed",
      line: expect.stringMatching(/-> 401/),
    });
  });

  it("reads exit 3 with `cannot fetch` as a server failure", () => {
    const stderr = "cannot fetch http://192.0.2.1:3000/api/projects: connection refused\n";
    expect(lookupResult(3, "", stderr)).toEqual({
      kind: "failed",
      line: "cannot fetch http://192.0.2.1:3000/api/projects: connection refused",
    });
  });

  it("reads any other non-zero exit as a failure, naming it when the CLI printed nothing", () => {
    expect(lookupResult(1, "", "")).toEqual({
      kind: "failed",
      line: "pixelslash builds exited 1 and printed nothing",
    });
  });
});

describe("lookupFailure", () => {
  it("reports a 401 as a token that needs reissuing, not as PixelSlash not answering", () => {
    const failure = lookupFailure([
      {
        project: "hackcove-ui-denied",
        result: {
          kind: "failed",
          line: "GET /api/projects/hackcove-ui-denied/builds -> 401 unauthorized",
        },
      },
    ]);
    expect(failure).toContain("PixelSlash refused the token for hackcove-ui-denied");
    expect(failure).toContain("-> 401");
    expect(failure).toContain("needs reissuing");
    expect(failure).not.toContain("did not answer");
    expect(failure).not.toContain("pixelslash project create");
  });

  it("is undefined when every lookup gave a listing", () => {
    expect(lookupFailure([])).toBeUndefined();
  });
});
