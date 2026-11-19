import { describe, expect, test } from "vitest";
import * as ui from "@slashsuite/ui-react";
import { loadingPage } from "../../../packages/ui-react/docs/components/loading";

/** Every component `@slashsuite/ui-react` exports: its exported functions named in PascalCase. */
const components = Object.entries(ui)
  .filter(([name, value]) => /^[A-Z]/.test(name) && typeof value === "function")
  .map(([name]) => name);

describe("the Loading page's inventory", () => {
  test("names every exported component, in code, either as taking loading or drawing as itself", () => {
    const text = loadingPage.usage.do.join("\n");
    const missing = components.filter((name) => !text.includes(`\`${name}\``));
    expect(missing, "exported but not on the Loading page's inventory").toEqual([]);
  });
});
