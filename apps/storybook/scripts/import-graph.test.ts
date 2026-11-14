import { describe, expect, it } from "vitest";
import { barrelOf, closureOf } from "./import-graph.js";
import { repo } from "./visual-plan.fixture.js";

describe("closureOf", () => {
  const barrel = barrelOf(repo.read);

  it("follows a named import through the barrel to its module only", () => {
    const closure = closureOf("apps/storybook/src/Button.stories.tsx", repo.read, barrel);
    expect([...closure].toSorted()).toEqual([
      "apps/storybook/src/Button.stories.tsx",
      "packages/ui-react/src/Button.tsx",
      "packages/ui-react/src/focus.ts",
      "packages/ui-react/src/index.ts",
    ]);
  });

  it("skips type-only imports and follows a namespace import to every module", () => {
    const card = closureOf("apps/storybook/src/Card.stories.tsx", repo.read, barrel);
    expect(card.has("packages/ui-react/src/Button.tsx")).toBe(false);
    expect(card.has("apps/storybook/src/sample.ts")).toBe(true);
    const overview = closureOf("apps/storybook/src/overview.stories.tsx", repo.read, barrel);
    expect(overview.has("packages/ui-react/src/Stack.tsx")).toBe(true);
  });
});
