// @vitest-environment jsdom
import { CalendarDate } from "@internationalized/date";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mount, stubDialog, unmount } from "./dom.harness.js";
import * as ui from "./index.js";
import { A, CASES } from "./passthrough.harness.js";

// Every exported component passes `data-*` and `aria-*` through: a consumer hangs an e2e hook
// (`data-testid`) or a description on the part itself and never wraps it in an element of its own.
// Each case renders one component with both attributes; the last test fails for an export that has
// no case, so a new component adds its own.

/** Where a case lands: the `<dialog>`s sit in the document, the rest in the mounted container. */
function probes(): Element[] {
  return Array.from(document.querySelectorAll('[data-testid="probe"]'));
}

/**
 * React Aria's date field puts `data-*` on its wrapper and `aria-describedby` on the field group
 * (merging the id with its own description), so the description is asserted inside the probe. A
 * `Radio` does the same: `data-*` on its label, the description on the input inside it.
 */
const SPLIT = new Set(["DateField", "Radio"]);

describe("every exported component passes data-* and aria-* through", () => {
  beforeEach(stubDialog);
  afterEach(unmount);

  it("has a case for every exported component, and no stale one", () => {
    const components = Object.keys(ui).filter((name) => /^[A-Z]/.test(name));
    expect(Object.keys(CASES).toSorted()).toEqual(components.toSorted());
  });

  for (const [name, build] of Object.entries(CASES).filter(([n]) => !SPLIT.has(n))) {
    it(`${name} puts both on one element`, () => {
      mount(build());
      const found = probes();
      expect(found, `${name}: no element carries data-testid`).toHaveLength(1);
      expect(found[0]?.getAttribute("aria-describedby"), `${name}: aria-describedby`).toBe(
        "described",
      );
    });
  }

  it("a Button that is a link puts both on the <a>", () => {
    mount(
      <ui.Button href="/x" {...A}>
        x
      </ui.Button>,
    );
    const found = probes();
    expect(found).toHaveLength(1);
    expect(found[0]?.tagName).toBe("A");
    expect(found[0]?.getAttribute("aria-describedby")).toBe("described");
  });

  it("a Card that is a link puts both on the card root, not on the link inside it", () => {
    mount(
      <ui.Card href="/x" title="T" {...A}>
        x
      </ui.Card>,
    );
    const found = probes();
    expect(found).toHaveLength(1);
    expect(found[0]?.tagName).toBe("DIV");
    expect(found[0]?.getAttribute("aria-describedby")).toBe("described");
    expect(found[0]?.querySelector("a")?.hasAttribute("aria-describedby")).toBe(false);
  });

  for (const name of SPLIT) {
    it(`${name} puts data-* on its wrapper and the description on the field inside`, () => {
      mount(CASES[name]?.() ?? <div />);
      const found = probes();
      expect(found, `${name}: no element carries data-testid`).toHaveLength(1);
      expect(found[0]?.querySelector('[aria-describedby~="described"]')).not.toBeNull();
    });
  }

  it("a calendar DateField puts data-* on its wrapper and the description on the field inside", () => {
    mount(<ui.DateField calendar label="Day" defaultValue={new CalendarDate(2026, 1, 2)} {...A} />);
    const found = probes();
    expect(found).toHaveLength(1);
    expect(found[0]?.querySelector('[aria-describedby~="described"]')).not.toBeNull();
  });
});
