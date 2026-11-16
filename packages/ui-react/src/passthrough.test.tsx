// @vitest-environment jsdom
import { CalendarDate } from "@internationalized/date";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mount, stubDialog, stubPopover, unmount, unstubPopover } from "./dom.harness.js";
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
const SPLIT = new Set(["DateField", "DateRangePicker", "Radio"]);

/**
 * Parts whose `id` is a prop of their own, not the root's: a `Section`'s anchors its heading, and a
 * `SortableSection`'s or `SortableItem`'s is its key in the list's moves.
 */
/** Parts that render no element of their own, so there is no root to pass anything to. */
const NO_ROOT = new Set(["LinkProvider"]);

const OWN_ID = new Set(["Section", "SortableSection", "SortableItem"]);

describe("every exported component passes id, data-* and aria-* through", () => {
  beforeEach(stubDialog);
  afterEach(unmount);

  it("has a case for every exported component, and no stale one", () => {
    const components = Object.keys(ui).filter((name) => /^[A-Z]/.test(name) && !NO_ROOT.has(name));
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

  for (const name of Object.keys(CASES).filter((n) => !SPLIT.has(n) && !OWN_ID.has(n))) {
    it(`${name} puts the id on that element`, () => {
      mount(CASES[name]?.() ?? <div />);
      expect(probes()[0]?.id, `${name}: id`).toBe("probe-id");
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

  it("a blocked Button keeps the caller's aria-describedby and adds its tooltip to it", () => {
    stubPopover();
    mount(
      <ui.Button disabledReason="Pick a shop first" {...A}>
        Save
      </ui.Button>,
    );
    const ids = probes()[0]?.getAttribute("aria-describedby")?.split(" ") ?? [];
    expect(ids[0]).toBe("described");
    expect(ids.slice(1).map((id) => document.getElementById(id)?.textContent)).toEqual([
      "Pick a shop first",
    ]);
    unstubPopover();
  });

  it("an Avatar with onClick puts both on its <button>, not on the mark inside it", () => {
    mount(<ui.Avatar name="Ada Lovelace" onClick={() => undefined} {...A} />);
    const found = probes();
    expect(found).toHaveLength(1);
    expect(found[0]?.tagName).toBe("BUTTON");
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

  it("a static ListRow puts both on its row", () => {
    mount(<ui.ListRow {...A}>x</ui.ListRow>);
    const found = probes();
    expect(found).toHaveLength(1);
    expect(found[0]?.getAttribute("aria-describedby")).toBe("described");
  });

  it("a CardGrid as=ul puts both on its <ul>", () => {
    mount(
      <ui.CardGrid as="ul" {...A}>
        <p>x</p>
      </ui.CardGrid>,
    );
    const found = probes();
    expect(found).toHaveLength(1);
    expect(found[0]?.tagName).toBe("UL");
    expect(found[0]?.getAttribute("aria-describedby")).toBe("described");
  });

  it("a removable button Pill puts both on its button, not on the shell or the x", () => {
    mount(
      <ui.Pill onClick={() => undefined} onRemove={() => undefined} removeLabel="Remove" {...A}>
        x
      </ui.Pill>,
    );
    const found = probes();
    expect(found).toHaveLength(1);
    expect(found[0]?.tagName).toBe("BUTTON");
    expect(found[0]?.textContent).toBe("x");
    expect(found[0]?.getAttribute("aria-describedby")).toBe("described");
  });

  it("a removable plain Pill puts both on its shell", () => {
    mount(
      <ui.Pill onRemove={() => undefined} removeLabel="Remove" {...A}>
        x
      </ui.Pill>,
    );
    const found = probes();
    expect(found).toHaveLength(1);
    expect(found[0]?.tagName).toBe("SPAN");
    expect(found[0]?.getAttribute("aria-describedby")).toBe("described");
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
