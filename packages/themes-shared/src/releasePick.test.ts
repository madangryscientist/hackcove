import { describe, expect, it } from "vitest";
import {
  classify,
  type Facts,
  needsToken,
  pick,
  stagePlaceholder,
} from "../../../scripts/releasePick";

// The release workflow's "Pick" step (scripts/releasePick.ts). The facts are what git and npm
// report for one project; each case is a state a real package goes through.
const name = "@hackcove/oxlint-testing";
const facts = (over: Partial<Facts>): Facts => ({
  name,
  tagged: true,
  nameAtLastTag: name,
  npmVersions: ["0.1.0"],
  ...over,
});

describe("releasePick: classify", () => {
  it("files a project with no release tag as new", () => {
    expect(classify(facts({ tagged: false, nameAtLastTag: null, npmVersions: null }))).toBe("new");
  });

  it("files a staged first version that waits for approval as staged, not new again", () => {
    // npm publishes the placeholder the moment a brand-new package is staged.
    expect(classify(facts({ npmVersions: [stagePlaceholder] }))).toBe("staged");
  });

  it("files it as staged when npm shows no placeholder either", () => {
    expect(classify(facts({ npmVersions: null }))).toBe("staged");
  });

  it("files it as tagged once the maintainer approved a version", () => {
    expect(classify(facts({ npmVersions: [stagePlaceholder, "0.1.0"] }))).toBe("tagged");
  });

  it("keeps a published package tagged when its newest version is not on npm yet", () => {
    // An OIDC publish that failed after the tag was pushed: the next commit releases the next version.
    expect(classify(facts({ npmVersions: ["0.1.0"] }))).toBe("tagged");
  });

  it("files a rename that carries its predecessor's tag as renamed", () => {
    // The copied tag points at a commit where the folder held the old package, or nothing.
    expect(classify(facts({ nameAtLastTag: "@hackcove/ui", npmVersions: null }))).toBe("renamed");
    expect(classify(facts({ nameAtLastTag: null, npmVersions: null }))).toBe("renamed");
  });
});

describe("releasePick: pick and needsToken", () => {
  it("sorts every project and asks for the token only for what it stages", () => {
    const sets = pick([
      {
        project: "ui-react",
        facts: facts({ name: "@hackcove/ui-react", nameAtLastTag: "@hackcove/ui-react" }),
      },
      { project: "oxlint-testing", facts: facts({ npmVersions: [stagePlaceholder] }) },
    ]);
    expect(sets).toEqual({
      new: [],
      renamed: [],
      staged: ["oxlint-testing"],
      tagged: ["ui-react"],
    });
    expect(needsToken(sets)).toBe(false);
    expect(needsToken({ ...sets, new: ["codemod"] })).toBe(true);
    expect(needsToken({ ...sets, renamed: ["ui-react"] })).toBe(true);
  });
});
