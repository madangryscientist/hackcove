import { describe, expect, test } from "vitest";
import { componentPages } from "../src/content/components/index";
import { docOf } from "../src/docs/Props";
import { listedValues } from "./usageRules";

describe("listedValues", () => {
  test.each([
    ["`size` is `sm`, `md` (default) or `lg`.", "size", ["sm", "md", "lg"]],
    ["`size` is `sm`, `md` (a `Button`'s) or `lg`.", "size", ["sm", "md", "lg"]],
    ["`tone` is `accent` or `danger`; `size` is `sm`.", "tone", ["accent", "danger"]],
    ["`width` is `full`; `xs` and `sm` are fixed.", "width", ["full", "xs", "sm"]],
    ["`separator` is `·` or `none`.", "separator", ["·", "none"]],
    ["`aspect` is `square`, `4:3` or `16:9`. More here.", "aspect", ["square", "4:3", "16:9"]],
    ["`tone` is `neutral` or `info`.", "size", undefined],
    ["Give it a `size`: `sm` or `lg`.", "size", undefined],
    ["`width` is a `Stack` cap.", "width", []],
  ])("%j for %s lists %j", (rule, prop, values) => {
    expect(listedValues(rule, prop)).toEqual(values);
  });
});

/** The members of a prop's type when it is a union of string literals, else nothing. */
function literalsOf(type: string): string[] | undefined {
  const arms = type.split(" | ").filter((arm) => arm !== "undefined");
  return arms.every((arm) => /^"[^"]*"$/.test(arm))
    ? arms.map((arm) => arm.slice(1, -1))
    : undefined;
}

describe("a usage rule that lists a prop's values lists them all", () => {
  const listings = componentPages.flatMap((page) =>
    page.usage.do.flatMap((rule) =>
      page.api.flatMap((name) =>
        docOf(name).props.flatMap((prop) => {
          const union = literalsOf(prop.type);
          const listed = listedValues(rule, prop.name);
          return union === undefined || listed === undefined || listed.length === 0
            ? []
            : [{ at: `${page.slug}: ${name}.${prop.name}`, union, listed, fallback: prop.default }];
        }),
      ),
    ),
  );

  test("some rules list values", () => {
    expect(listings.length).toBeGreaterThan(0);
  });

  // A rule may leave the default out, when it says what a prop left out does.
  test.each(listings)("$at", ({ union, listed, fallback }) => {
    const all = union.toSorted();
    const named = [...new Set(listed)].toSorted();
    expect([all, all.filter((value) => value !== fallback)]).toContainEqual(named);
  });
});
