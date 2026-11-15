// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { Avatar, avatarColourClass, initialsOf } from "./Avatar.js";
import { render, screen } from "./render.harness.js";

describe("avatarColourClass", () => {
  it("gives the same name the same colour", () => {
    expect(avatarColourClass("octocat")).toBe(avatarColourClass("octocat"));
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
    render(<Avatar name="Ada Lovelace" />);
    const mark = screen.getByTitle("Ada Lovelace");
    expect(mark.textContent).toBe("AD");
    expect(mark.getAttribute("aria-hidden")).toBe("true");
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("is a plain mark, not a button, without onClick", () => {
    render(
      <>
        <Avatar name="Ada Lovelace" />
        <Avatar name="Ada Lovelace" src="/a.jpg" />
      </>,
    );
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("is an image named for the person, in place of the initials, when given a src", () => {
    render(<Avatar name="Ada Lovelace" src="/team/ada.jpg" size="xl" />);
    const img = screen.getByRole("img", { name: "Ada Lovelace" });
    expect(img.getAttribute("src")).toBe("/team/ada.jpg");
    expect(img.hasAttribute("aria-hidden")).toBe(false);
    expect(screen.queryByText("AD")).toBeNull();
  });
});
