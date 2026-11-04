import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AvatarStack } from "./AvatarStack.js";

const people = [{ name: "ada" }, { name: "grace" }, { name: "linus" }, { name: "margaret" }];
const classes = (out: string, text: string) =>
  new RegExp(`class="([^"]*)"[^>]*>${text.replace("+", "\\+")}<`).exec(out)?.[1]?.split(" ") ?? [];

describe("AvatarStack", () => {
  it("is one image named by the people in it", () => {
    const out = renderToStaticMarkup(<AvatarStack people={people} />);
    expect(out).toMatch(/^<span role="img" aria-label="ada, grace, linus, margaret" /);
    expect(out.match(/>[A-Z?]{1,2}<\/span>/g)).toHaveLength(4);
  });

  it("rings every avatar in the page colour and overlaps all but the first", () => {
    const out = renderToStaticMarkup(<AvatarStack people={people} />);
    expect(classes(out, "AD")).toEqual(expect.arrayContaining(["border-2", "border-slate-50"]));
    expect(classes(out, "AD")).not.toContain("-ml-2");
    expect(classes(out, "GR")).toEqual(expect.arrayContaining(["border-slate-50", "-ml-2"]));
  });

  it("scales the overlap with the size", () => {
    expect(
      classes(renderToStaticMarkup(<AvatarStack people={people} size="sm" />), "GR"),
    ).toContain("-ml-1.5");
    expect(
      classes(renderToStaticMarkup(<AvatarStack people={people} size="2xl" />), "GR"),
    ).toContain("-ml-6");
  });

  it("shows `max` avatars and a +N chip of the same size and shape for the rest", () => {
    const out = renderToStaticMarkup(
      <AvatarStack people={people} max={2} size="lg" shape="square" />,
    );
    expect(out).toContain('aria-label="ada, grace and 2 more"');
    expect(out).not.toContain(">LI<");
    const chip = classes(out, "+2");
    expect(chip).toEqual(
      expect.arrayContaining([
        "size-10",
        "rounded-md",
        "border-slate-50",
        "-ml-2.5",
        "bg-slate-100",
      ]),
    );
    expect(out).toContain('title="linus, margaret"');
  });

  it("has no chip when everyone fits", () => {
    expect(renderToStaticMarkup(<AvatarStack people={people} max={4} />)).not.toContain("+");
  });

  it("draws a photo in the same ring", () => {
    const out = renderToStaticMarkup(
      <AvatarStack people={[{ name: "ada" }, { name: "Grace", src: "/g.jpg" }]} />,
    );
    expect(out).toMatch(
      /<img src="\/g.jpg" alt="Grace" title="Grace" class="[^"]*border-slate-50[^"]*-ml-2/,
    );
  });
});
