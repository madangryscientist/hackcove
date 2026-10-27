import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Avatar, avatarColourClass, initialsOf } from "./Avatar.js";

describe("avatarColourClass", () => {
  it("gives the same name the same stock background class", () => {
    expect(avatarColourClass("octocat")).toBe(avatarColourClass("octocat"));
    expect(avatarColourClass("octocat")).toMatch(/^bg-[a-z]+-\d{3}$/);
  });

  it("spreads different names over more than one colour", () => {
    const names = ["ada", "grace", "linus", "margaret", "dennis", "ken", "barbara", "alan"];
    expect(new Set(names.map(avatarColourClass)).size).toBeGreaterThan(2);
  });
});

describe("initialsOf", () => {
  it("takes two characters, upper-cased, with punctuation stripped", () => {
    expect(initialsOf("octocat")).toBe("OC");
    expect(initialsOf("-a_b.c")).toBe("AB");
    expect(initialsOf("x")).toBe("X");
  });

  it("is ? for a name with nothing to show", () => {
    expect(initialsOf("")).toBe("?");
    expect(initialsOf("--__")).toBe("?");
  });
});

describe("Avatar", () => {
  it("shows the initials, titles the name and hides itself from assistive tech", () => {
    const out = renderToStaticMarkup(<Avatar name="Ada Lovelace" />);
    expect(out).toContain(">AD</span>");
    expect(out).toContain('title="Ada Lovelace"');
    expect(out).toContain('aria-hidden="true"');
  });

  it("colours with a class, never an inline style", () => {
    const out = renderToStaticMarkup(<Avatar name="octocat" />);
    expect(out).toContain(avatarColourClass("octocat"));
    expect(out).not.toContain("style=");
  });

  it("is md by default and sizes by class", () => {
    expect(renderToStaticMarkup(<Avatar name="a" />)).toContain("size-8");
    expect(renderToStaticMarkup(<Avatar name="a" size="sm" />)).toContain("size-6");
    expect(renderToStaticMarkup(<Avatar name="a" size="lg" />)).toContain("size-10");
  });

  it("adds the overlap ring only when asked", () => {
    expect(renderToStaticMarkup(<Avatar name="a" />)).not.toContain("border-2");
    expect(renderToStaticMarkup(<Avatar name="a" ring />)).toContain("border-slate-50");
  });

  it("has xl (56px) and 2xl (96px) sizes", () => {
    expect(renderToStaticMarkup(<Avatar name="a" size="xl" />)).toContain("size-14");
    expect(renderToStaticMarkup(<Avatar name="a" size="2xl" />)).toContain("size-24");
  });

  it("renders a round, cropped image named for the person when given a src", () => {
    const out = renderToStaticMarkup(<Avatar name="Ada Lovelace" src="/team/ada.jpg" size="xl" />);
    expect(out).toContain("<img ");
    expect(out).toContain('src="/team/ada.jpg"');
    expect(out).toContain('alt="Ada Lovelace"');
    expect(out).toContain("rounded-full");
    expect(out).toContain("object-cover");
    expect(out).toContain("size-14");
    expect(out).not.toContain("aria-hidden");
    expect(out).not.toContain("AD");
    expect(out).not.toContain(avatarColourClass("Ada Lovelace"));
  });

  it("keeps the overlap ring on a photo", () => {
    expect(renderToStaticMarkup(<Avatar name="a" src="/a.jpg" ring />)).toContain(
      "border-slate-50",
    );
  });
});
