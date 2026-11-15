// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { BulletList } from "./BulletList.js";
import { render, screen, within } from "./render.harness.js";

describe("BulletList", () => {
  it("is a list of its li children, in order", () => {
    render(
      <BulletList>
        <li>one</li>
        <li>two</li>
      </BulletList>,
    );
    const items = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(items.map((item) => item.textContent)).toEqual(["one", "two"]);
  });
});
