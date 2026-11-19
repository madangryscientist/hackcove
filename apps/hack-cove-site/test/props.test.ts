import { describe, expect, test } from "vitest";
import { mergeArmDocs } from "../scripts/armDocs";
import { NATIVE } from "../scripts/generate-props";
import propsJson from "../../../packages/ui-react/docs/props.json";
import { docOf } from "../src/docs/Props";

describe("props.json: native props", () => {
  const listed = Object.entries(NATIVE).flatMap(([component, props]) =>
    Object.keys(props).map((prop) => ({ component, prop })),
  );

  test.each(listed)("$component.$prop is listed, marked native", ({ component, prop }) => {
    const doc = docOf(component).props.find((p) => p.name === prop);
    expect(doc?.native).toBe(true);
    expect(doc?.description).toBe(NATIVE[component]?.[prop]);
  });

  test("a prop the component declares itself is not native", () => {
    expect(docOf("Button").props.find((p) => p.name === "variant")?.native).toBe(false);
  });
});

describe("mergeArmDocs", () => {
  test.each([
    { arms: [{ text: "Its size.", absent: false }], merged: "Its size." },
    {
      arms: [
        { text: "Its size.", absent: false },
        { text: "Its size.", absent: false },
      ],
      merged: "Its size.",
    },
    {
      arms: [
        { text: "Only a rail takes a `size`.", absent: true },
        { text: "Its size.", absent: false },
      ],
      merged: "Its size. Only a rail takes a `size`.",
    },
    {
      arms: [
        { text: "Its size.", absent: true },
        { text: "Its size.", absent: false },
      ],
      merged: "Its size.",
    },
    {
      arms: [
        { text: "", absent: false },
        { text: "Its size.", absent: false },
      ],
      merged: "Its size.",
    },
  ])("$merged", ({ arms, merged }) => {
    expect(mergeArmDocs(arms)).toBe(merged);
  });

  test("two arms that take the prop and say different things throw", () => {
    expect(() =>
      mergeArmDocs([
        { text: "The button.", absent: false },
        { text: "The link.", absent: false },
      ]),
    ).toThrow(/union arms disagree/);
  });
});

/** A text's sentences, split after each full stop. */
const sentences = (text: string) =>
  text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .filter((s) => s !== "");

describe("props.json: one text per prop", () => {
  test("no prop's description says a sentence twice", () => {
    const doubled = Object.values(propsJson).flatMap((doc) =>
      doc.props
        .filter((p) => new Set(sentences(p.description)).size !== sentences(p.description).length)
        .map((p) => `${doc.name}.${p.name}`),
    );
    expect(doubled).toEqual([]);
  });
});
