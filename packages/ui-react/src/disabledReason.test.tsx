// @vitest-environment jsdom
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Checkbox } from "./Checkbox.js";
import { stubPopover, unstubPopover } from "./dom.harness.js";
import { IconButton } from "./IconButton.js";
import { ListRow } from "./ListRow.js";
import { render, screen, user } from "./render.harness.js";
import { SegmentedControl } from "./SegmentedControl.js";
import { Switch } from "./Switch.js";
import { Tabs } from "./Tabs.js";

// `disabledReason` is one behaviour on every control that can be blocked: the control is
// `aria-disabled`, stays focusable, ignores a click, Enter and Space, and its description is the
// reason (shown as its tooltip). One case per part; each is reached the way a keyboard reaches it.

/** The accessible description: the text of the elements `aria-describedby` names, in order. */
function description(element: Element): string {
  const ids = element.getAttribute("aria-describedby")?.split(/\s+/) ?? [];
  return ids
    .map((id) => document.getElementById(id)?.textContent ?? "")
    .filter(Boolean)
    .join(" ");
}

const REASON = "Ask an admin first";

type Case = {
  name: string;
  /** Draws the part with `disabledReason={REASON}`, calling `act` on any change. */
  draw: (act: () => void) => ReactElement;
  /** The blocked control, by role and name. */
  find: () => HTMLElement;
  /** How the keyboard reaches it from the start of the page. */
  reach: (u: ReturnType<typeof user>) => Promise<void>;
  /** The keys that would act on it. */
  keys: string;
};

const tab = async (u: ReturnType<typeof user>) => u.tab();

const CASES: Case[] = [
  {
    name: "IconButton",
    draw: (act) => <IconButton label="Delete" icon="close" disabledReason={REASON} onClick={act} />,
    find: () => screen.getByRole("button", { name: "Delete" }),
    reach: tab,
    keys: "{Enter} ",
  },
  {
    name: "a Tabs option",
    draw: (act) => (
      <Tabs
        label="Views"
        value="a"
        onChange={act}
        items={[
          { value: "a", label: "Overview" },
          { value: "b", label: "Billing", disabledReason: REASON },
        ]}
      />
    ),
    find: () => screen.getByRole("tab", { name: "Billing" }),
    reach: async (u) => {
      await u.tab();
      await u.keyboard("{ArrowRight}");
    },
    keys: "{Enter} ",
  },
  {
    name: "a SegmentedControl option",
    draw: (act) => (
      <SegmentedControl
        label="Range"
        value="a"
        onChange={act}
        items={[
          { value: "a", label: "Week" },
          { value: "b", label: "Year", disabledReason: REASON },
        ]}
      />
    ),
    find: () => screen.getByRole("radio", { name: "Year" }),
    reach: async (u) => {
      await u.tab();
      await u.keyboard("{ArrowRight}");
    },
    keys: "{Enter} ",
  },
  {
    name: "ListRow as a button",
    draw: (act) => (
      <ListRow onClick={act} disabledReason={REASON}>
        Rent
      </ListRow>
    ),
    find: () => screen.getByRole("button", { name: "Rent" }),
    reach: tab,
    keys: "{Enter} ",
  },
  {
    name: "Checkbox",
    draw: (act) => <Checkbox label="Notify me" onChange={act} disabledReason={REASON} />,
    find: () => screen.getByRole("checkbox", { name: "Notify me" }),
    reach: tab,
    keys: " ",
  },
  {
    name: "Switch",
    draw: (act) => <Switch label="Live" checked={false} onChange={act} disabledReason={REASON} />,
    find: () => screen.getByRole("switch", { name: "Live" }),
    reach: tab,
    keys: "{Enter} ",
  },
];

/** The title a browser shows on hover, where the reason lives without anchor positioning. */
const title = (element: Element): string | null => element.getAttribute("title");

// Enhanced, the reason is the tooltip, linked as the description; else the native title.
describe.each([
  ["with anchor positioning", true, description],
  ["with the native title", false, title],
] as const)("disabledReason, %s", (_, enhanced, reason) => {
  beforeEach(() => {
    if (enhanced) stubPopover();
  });
  afterEach(unstubPopover);

  for (const part of CASES) {
    it(`${part.name} is aria-disabled, keeps focus, ignores a click and the keys`, async () => {
      const act = vi.fn<() => void>();
      render(part.draw(act));
      const control = part.find();
      expect(control.getAttribute("aria-disabled")).toBe("true");
      const u = user();
      await part.reach(u);
      expect(document.activeElement).toBe(control);
      await u.keyboard(part.keys);
      await u.click(control);
      expect(act).not.toHaveBeenCalled();
      expect(control).not.toHaveProperty("checked", true);
      expect(reason(control)).toBe(REASON);
    });
  }
});

it("treats an empty disabledReason as no reason: the control is not blocked", async () => {
  const act = vi.fn<() => void>();
  render(<IconButton label="Delete" icon="close" disabledReason="" onClick={act} />);
  const button = screen.getByRole("button", { name: "Delete" });
  expect(button.hasAttribute("aria-disabled")).toBe(false);
  expect(button.getAttribute("title")).toBe("Delete");
  await user().click(button);
  expect(act).toHaveBeenCalledTimes(1);
});
