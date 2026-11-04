import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Avatar, avatarColourClass, initialsOf } from "./Avatar.js";

/** The classes on the first element of some markup. */
function classes(out: string): string[] {
  return /class="([^"]*)"/.exec(out)?.[1]?.split(" ") ?? [];
}

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

  it("has no ring of its own: the overlap ring belongs to AvatarStack", () => {
    expect(renderToStaticMarkup(<Avatar name="a" />)).not.toContain("border-2");
  });

  it("is round by default and square (rounded corners) for an org, at every size", () => {
    expect(classes(renderToStaticMarkup(<Avatar name="a" />))).toContain("rounded-full");
    const corners = [
      ["sm", "rounded"],
      ["md", "rounded-md"],
      ["lg", "rounded-md"],
      ["xl", "rounded-lg"],
      ["2xl", "rounded-xl"],
    ] as const;
    for (const [size, corner] of corners) {
      for (const src of [undefined, "/acme.png"]) {
        const out = classes(
          renderToStaticMarkup(<Avatar name="Acme" src={src} shape="square" size={size} />),
        );
        expect(out).toContain(corner);
        expect(out).not.toContain("rounded-full");
      }
    }
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
});
