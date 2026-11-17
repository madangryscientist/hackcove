// @vitest-environment jsdom
import type { ReactElement } from "react";
import { describe, expect, expectTypeOf, it, vi } from "vitest";
import { render, screen, user, within } from "./render.harness.js";
import { SegmentedControl } from "./SegmentedControl.js";
import type { SwitchItem, SwitchProps } from "./switcher.js";
import { Tabs } from "./Tabs.js";

const items = [
  { value: "day", label: "Daily" },
  { value: "week", label: "Weekly" },
  { value: "dream", label: "Dream", disabled: true },
  { value: "year", label: "Yearly" },
];

type Kind = {
  Component: (props: SwitchProps) => ReactElement;
  group: "tablist" | "radiogroup";
  role: "tab" | "radio";
  selected: "aria-selected" | "aria-checked";
};
const kinds: Array<[string, Kind]> = [
  ["Tabs", { Component: Tabs, group: "tablist", role: "tab", selected: "aria-selected" }],
  [
    "SegmentedControl",
    { Component: SegmentedControl, group: "radiogroup", role: "radio", selected: "aria-checked" },
  ],
];

/** Draw the four `items` in a group named "Range". */
function drawWith(
  Component: Kind["Component"],
  value: string,
  onChange: (value: string) => void,
): void {
  render(<Component items={items} value={value} label="Range" onChange={onChange} />);
}

describe.each(kinds)("%s", (_name, { Component, group, role, selected }) => {
  const draw = (value = "day", onChange: (value: string) => void = () => {}): void =>
    drawWith(Component, value, onChange);
  const option = (name: string): HTMLElement => screen.getByRole(role, { name });

  it("is a named group of options with the current one selected", () => {
    draw("week");
    const options = within(screen.getByRole(group, { name: "Range" })).getAllByRole(role);
    expect(options.map((o) => o.getAttribute(selected))).toEqual([
      "false",
      "true",
      "false",
      "false",
    ]);
  });

  it("calls onChange with the value of a clicked option", async () => {
    const onChange = vi.fn<(value: string) => void>();
    draw("day", onChange);
    await user().click(option("Yearly"));
    expect(onChange).toHaveBeenCalledExactlyOnceWith("year");
  });

  it("does not call onChange for a disabled option", async () => {
    const onChange = vi.fn<(value: string) => void>();
    draw("day", onChange);
    expect(option("Dream").getAttribute("aria-disabled")).toBe("true");
    await user().click(option("Dream"));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("keeps a disabled option's title as its description, in the page and not disabled outright", () => {
    render(
      <Component
        items={[
          { value: "a", label: "A" },
          { value: "b", label: "B", disabled: true, title: "Needs a second shot" },
        ]}
        value="a"
        onChange={() => {}}
        label="Range"
      />,
    );
    const b = screen.getByRole(role, { name: "B", description: "Needs a second shot" });
    expect(b.getAttribute("aria-disabled")).toBe("true");
    expect(b.hasAttribute("disabled")).toBe(false);
    expect(option("A").hasAttribute("aria-disabled")).toBe(false);
  });

  it("puts a count after the label, in the accessible name", () => {
    render(
      <Component
        items={[
          { value: "a", label: "Shots", count: 12 },
          { value: "b", label: "Clips", count: 0 },
          { value: "c", label: "Notes" },
        ]}
        value="a"
        onChange={() => {}}
        label="Range"
      />,
    );
    expect(screen.getAllByRole(role).map((o) => o.textContent)).toEqual([
      "Shots 12",
      "Clips 0",
      "Notes",
    ]);
    expect(option("Shots 12")).not.toBeNull();
  });

  it("disables every option with the group: no tab stop, no choice, no arrow movement", async () => {
    const onChange = vi.fn<(value: string) => void>();
    render(<Component items={items} value="day" onChange={onChange} label="Range" disabled />);
    expect(screen.getByRole(group, { name: "Range" }).getAttribute("aria-disabled")).toBe("true");
    expect(screen.getAllByRole(role).map((o) => o.getAttribute("aria-disabled"))).toEqual([
      "true",
      "true",
      "true",
      "true",
    ]);
    const u = user();
    await u.tab();
    expect(document.activeElement).toBe(document.body);
    await u.click(option("Yearly"));
    await u.keyboard("{ArrowLeft}");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("gives a link option its title and count", () => {
    render(
      <Component
        label="Range"
        value="a"
        items={[{ value: "a", label: "A", href: "/a", count: 3, title: "Three of them" }]}
      />,
    );
    expect(screen.getByRole("link", { name: "A 3" }).getAttribute("title")).toBe("Three of them");
  });

  it("gives the current option the only tab stop", async () => {
    render(
      <>
        <Component items={items} value="week" onChange={() => {}} label="Range" />
        <button type="button">After</button>
      </>,
    );
    const u = user();
    await u.tab();
    expect(document.activeElement).toBe(option("Weekly"));
    await u.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "After" }));
  });

  it("gives the first enabled option the tab stop when none is current", async () => {
    draw("nothing");
    await user().tab();
    expect(document.activeElement).toBe(option("Daily"));
  });

  it("moves focus and the choice with the arrows, skipping a disabled option and wrapping", async () => {
    const onChange = vi.fn<(value: string) => void>();
    draw("week", onChange);
    const u = user();
    await u.tab();
    await u.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenLastCalledWith("year");
    expect(document.activeElement).toBe(option("Yearly"));
    await u.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenLastCalledWith("day");
    expect(document.activeElement).toBe(option("Daily"));
    await u.keyboard("{ArrowLeft}");
    expect(onChange).toHaveBeenLastCalledWith("year");
  });

  it("jumps to the first and last enabled option with Home and End", async () => {
    const onChange = vi.fn<(value: string) => void>();
    draw("week", onChange);
    const u = user();
    await u.tab();
    await u.keyboard("{End}");
    expect(onChange).toHaveBeenLastCalledWith("year");
    await u.keyboard("{Home}");
    expect(onChange).toHaveBeenLastCalledWith("day");
  });

  it("ignores other keys", async () => {
    const onChange = vi.fn<(value: string) => void>();
    draw("week", onChange);
    const u = user();
    await u.tab();
    await u.keyboard("a");
    expect(onChange).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(option("Weekly"));
  });

  it("draws link options as links in a named nav, the current one marked, an external one in a new tab", () => {
    render(
      <Component
        label="Range"
        value="a"
        items={[
          { value: "a", label: "A", href: "/a" },
          { value: "b", label: "B", href: "https://b.example", external: true },
        ]}
      />,
    );
    const nav = screen.getByRole("navigation", { name: "Range" });
    const a = within(nav).getByRole("link", { name: "A" });
    const b = within(nav).getByRole("link", { name: "B" });
    expect(a.getAttribute("href")).toBe("/a");
    expect(a.getAttribute("aria-current")).toBe("page");
    expect(b.hasAttribute("aria-current")).toBe(false);
    expect(b.getAttribute("target")).toBe("_blank");
    expect(b.getAttribute("rel")).toBe("noreferrer");
    expect(screen.queryByRole("button")).toBeNull();
  });
});

describe("Tabs", () => {
  it("says a vertical rail is vertical, and moves with the up and down arrows there", async () => {
    const onChange = vi.fn<(value: string) => void>();
    render(
      <Tabs items={items} value="day" onChange={onChange} label="Range" orientation="vertical" />,
    );
    expect(screen.getByRole("tablist", { name: "Range" }).getAttribute("aria-orientation")).toBe(
      "vertical",
    );
    const u = user();
    await u.tab();
    await u.keyboard("{ArrowDown}");
    expect(onChange).toHaveBeenLastCalledWith("week");
  });

  it("is not marked vertical across, where the up and down arrows do nothing", async () => {
    const onChange = vi.fn<(value: string) => void>();
    render(<Tabs items={items} value="day" onChange={onChange} label="Range" />);
    expect(screen.getByRole("tablist", { name: "Range" }).hasAttribute("aria-orientation")).toBe(
      false,
    );
    const u = user();
    await u.tab();
    await u.keyboard("{ArrowDown}");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("points a tab at its panel with controls", () => {
    render(
      <Tabs
        items={[{ value: "a", label: "A", controls: "panel-a" }]}
        value="a"
        onChange={() => {}}
        label="Range"
      />,
    );
    expect(screen.getByRole("tab", { name: "A" }).getAttribute("aria-controls")).toBe("panel-a");
  });
});

describe("SegmentedControl", () => {
  it("moves with the vertical arrows too", async () => {
    const onChange = vi.fn<(value: string) => void>();
    render(<SegmentedControl items={items} value="day" onChange={onChange} label="Range" />);
    const u = user();
    await u.tab();
    await u.keyboard("{ArrowDown}");
    expect(onChange).toHaveBeenLastCalledWith("week");
  });
});

/** Every key of every member of a union. */
type Keys<T> = T extends unknown ? keyof T : never;

describe("an item", () => {
  it("takes no styling key, only data-*", () => {
    expectTypeOf<Extract<Keys<SwitchItem>, `class${string}` | "style">>().toEqualTypeOf<never>();
  });
});
