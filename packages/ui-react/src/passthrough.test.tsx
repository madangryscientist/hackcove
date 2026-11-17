// @vitest-environment jsdom
import { CalendarDate } from "@internationalized/date";
import type { ReactElement } from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { stubDialog, stubPopover, unstubPopover } from "./dom.harness.js";
import * as ui from "./index.js";
import { A, CASES } from "./passthrough.harness.js";
import { render, screen, within } from "./render.harness.js";

// Every exported component passes `data-*` and `aria-*` through: a consumer hangs an e2e hook
// (`data-testid`) or a description on the part itself and never wraps it in an element of its own.
// Each case renders one component with both attributes; the first test fails for an export that has
// no case, so a new component adds its own. The probe is found by its test id: what it lands on is
// the subject here, whatever role that element has.

/** The case, beside the text its `aria-describedby` points at. */
function mount(node: ReactElement): void {
  render(
    <>
      {node}
      <p id="described">Read this</p>
    </>,
  );
}

/** The one element that carries the probe's attributes. */
function probe(): HTMLElement {
  expect(screen.getAllByTestId("probe")).toHaveLength(1);
  return screen.getByTestId("probe");
}

/**
 * React Aria's date field puts `data-*` on its wrapper and `aria-describedby` on the field group
 * (merging the id with its own description), so the description is found inside the probe, on the
 * part with this role. A `Radio` does the same: `data-*` on its label, the description on the input.
 */
const SPLIT: Record<string, string> = {
  DateField: "group",
  DateRangePicker: "group",
  Radio: "radio",
};

/** Parts that render no element of their own, so there is no root to pass anything to. */
const NO_ROOT = new Set(["LinkProvider"]);

/**
 * Parts whose `id` is a prop of their own, not the root's: a `Section`'s anchors its heading, and a
 * `SortableSection`'s or `SortableItem`'s is its key in the list's moves.
 */
const OWN_ID = new Set(["Section", "SortableSection", "SortableItem"]);

const exported = Object.keys(ui).filter((name) => /^[A-Z]/.test(name));
const whole = Object.entries(CASES).filter(([name]) => !(name in SPLIT));
const split = Object.entries(SPLIT).flatMap(([name, role]) => {
  const build = CASES[name];
  return build ? [[name, role, build] as const] : [];
});
const withId = whole.filter(([name]) => !OWN_ID.has(name));

describe("every exported component passes id, data-* and aria-* through", () => {
  beforeEach(stubDialog);

  it("has a case for every exported component, and no stale one", () => {
    const components = exported.filter((name) => !NO_ROOT.has(name));
    expect(Object.keys(CASES).toSorted()).toEqual(components.toSorted());
    expect(split.map(([name]) => name)).toEqual(Object.keys(SPLIT));
  });

  it.each(whole)("%s puts both on one element", (_name, build) => {
    mount(build());
    expect(probe().getAttribute("aria-describedby")).toBe("described");
  });

  it.each(withId)("%s puts the id on that element", (_name, build) => {
    mount(build());
    expect(probe().id).toBe("probe-id");
  });

  it("a Button that is a link puts both on the link", () => {
    mount(
      <ui.Button href="/x" {...A}>
        x
      </ui.Button>,
    );
    expect(screen.getByRole("link", { name: "x", description: "Read this" })).toBe(probe());
  });

  it("a blocked Button keeps the caller's description and adds its tooltip after it", () => {
    stubPopover();
    mount(
      <ui.Button disabledReason="Pick a shop first" {...A}>
        Save
      </ui.Button>,
    );
    expect(
      screen.getByRole("button", { name: "Save", description: "Read this Pick a shop first" }),
    ).toBe(probe());
    unstubPopover();
  });

  it("an Avatar with onClick puts both on its button, not on the mark inside it", () => {
    mount(<ui.Avatar name="Ada Lovelace" onClick={() => undefined} {...A} />);
    expect(screen.getByRole("button", { description: "Read this" })).toBe(probe());
  });

  it("a Card that is a link puts both on the card root, not on the link inside it", () => {
    mount(
      <ui.Card href="/x" title="T" {...A}>
        x
      </ui.Card>,
    );
    const link = within(probe()).getByRole("link");
    expect(link).not.toBe(probe());
    expect(link.hasAttribute("aria-describedby")).toBe(false);
  });

  it("a Card with a title puts both on its section", () => {
    mount(
      <ui.Card title="T" {...A}>
        x
      </ui.Card>,
    );
    expect(screen.getByRole("region", { name: "T", description: "Read this" })).toBe(probe());
  });

  it("a static ListRow puts both on its row", () => {
    mount(<ui.ListRow {...A}>x</ui.ListRow>);
    expect(probe().getAttribute("aria-describedby")).toBe("described");
  });

  it("a CardGrid as=ul puts both on its list", () => {
    mount(
      <ui.CardGrid as="ul" {...A}>
        <li>x</li>
      </ui.CardGrid>,
    );
    expect(screen.getByRole("list", { description: "Read this" })).toBe(probe());
  });

  it("a removable button Pill puts both on its button, not on the shell or the x", () => {
    mount(
      <ui.Pill onClick={() => undefined} onRemove={() => undefined} removeLabel="Remove" {...A}>
        x
      </ui.Pill>,
    );
    expect(screen.getByRole("button", { name: "x", description: "Read this" })).toBe(probe());
    expect(screen.getByRole("button", { name: "Remove" }).hasAttribute("aria-describedby")).toBe(
      false,
    );
  });

  it("a removable plain Pill puts both on its shell, around the x", () => {
    mount(
      <ui.Pill onRemove={() => undefined} removeLabel="Remove" {...A}>
        x
      </ui.Pill>,
    );
    expect(probe().getAttribute("aria-describedby")).toBe("described");
    expect(within(probe()).getByRole("button", { name: "Remove" })).not.toBe(probe());
  });

  it.each(split)(
    "%s puts data-* on its wrapper and the description on the field inside",
    (_name, role, build) => {
      mount(build());
      expect(within(probe()).getAllByRole(role, { description: /Read this/ })).not.toEqual([]);
    },
  );

  it("a calendar DateField puts data-* on its wrapper and the description on the field inside", () => {
    mount(<ui.DateField calendar label="Day" defaultValue={new CalendarDate(2026, 1, 2)} {...A} />);
    expect(within(probe()).getAllByRole("group", { description: /Read this/ })).not.toEqual([]);
  });
});
