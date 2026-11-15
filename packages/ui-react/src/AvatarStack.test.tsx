// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { AvatarStack } from "./AvatarStack.js";
import { render, screen, within } from "./render.harness.js";

const people = [{ name: "ada" }, { name: "grace" }, { name: "linus" }, { name: "margaret" }];

describe("AvatarStack", () => {
  it("is one image named by the people in it, in order", () => {
    render(<AvatarStack items={people} />);
    const stack = screen.getByRole("img", { name: "ada, grace, linus, margaret" });
    expect(screen.getAllByRole("img")).toHaveLength(1);
    for (const [before, after] of [
      ["AD", "GR"],
      ["GR", "LI"],
      ["LI", "MA"],
    ] as const) {
      const first = within(stack).getByText(before);
      const next = within(stack).getByText(after);
      expect(first.compareDocumentPosition(next) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    }
  });

  it("shows `max` avatars and a +N chip, titled by the rest, for the others", () => {
    render(<AvatarStack items={people} max={2} size="lg" shape="square" />);
    const stack = screen.getByRole("img", { name: "ada, grace and 2 more" });
    expect(within(stack).queryByText("LI")).toBeNull();
    const chip = within(stack).getByText("+2");
    expect(chip.getAttribute("title")).toBe("linus, margaret");
    expect(chip.getAttribute("aria-hidden")).toBe("true");
  });

  it("has no chip when everyone fits", () => {
    render(<AvatarStack items={people} max={4} />);
    expect(screen.getByRole("img", { name: "ada, grace, linus, margaret" })).not.toBeNull();
    expect(screen.queryByText(/^\+/)).toBeNull();
  });

  it("draws a photo inside the one image, titled by the person", () => {
    render(<AvatarStack items={[{ name: "ada" }, { name: "Grace", src: "/g.jpg" }]} />);
    const stack = screen.getByRole("img", { name: "ada, Grace" });
    const photo = within(stack).getByTitle("Grace");
    expect(photo.getAttribute("src")).toBe("/g.jpg");
    expect(within(stack).getByText("AD")).not.toBeNull();
  });
});
