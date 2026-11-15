// @vitest-environment jsdom
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";
import { Card } from "./Card.js";
import { mount, unmount } from "./dom.harness.js";

afterEach(unmount);

describe("Card fill", () => {
  it("is not on a link card", () => {
    const link = (
      // @ts-expect-error A card that is a link does not fill its parent.
      <Card href="/x" title="Shops" fill>
        body
      </Card>
    );
    expect(link.props.href).toBe("/x");
  });

  it("is not passed to the DOM", () => {
    const out = renderToStaticMarkup(
      <Card title="Shops nearby" bar flush fill>
        body
      </Card>,
    );
    expect(out).not.toContain("fill=");
  });

  it("is still a region named by its title, with or without a bar", () => {
    for (const bar of [true, false]) {
      const root = mount(
        <Card title="Shops nearby" bar={bar} fill>
          body
        </Card>,
      );
      const region = root.querySelector("section");
      const labelledBy = region?.getAttribute("aria-labelledby") ?? "";
      expect(document.getElementById(labelledBy)?.textContent).toBe("Shops nearby");
      expect(region?.textContent).toContain("body");
      unmount();
    }
  });
});
