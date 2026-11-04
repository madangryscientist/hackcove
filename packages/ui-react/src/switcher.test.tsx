// @vitest-environment jsdom
import { act, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { mount, unmount } from "./dom.harness.js";
import type { LinkRenderProps } from "./link.js";
import { SegmentedControl } from "./SegmentedControl.js";
import type { SwitchProps } from "./switcher.js";
import { Tabs } from "./Tabs.js";

afterEach(unmount);

const items = [
  { value: "day", label: "Daily" },
  { value: "week", label: "Weekly" },
  { value: "dream", label: "Dream", disabled: true },
  { value: "year", label: "Yearly" },
];

// A stand-in for a router's <Link>: it takes `to` and spreads the props it is handed.
const Link = ({ to, ...rest }: { to: string } & LinkRenderProps): ReactElement => (
  <a data-to={to} {...rest} />
);

const press = (element: Element | null | undefined, key: string): void => {
  act(() => {
    element?.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }));
  });
};

const stops = (out: HTMLElement): Array<string | null> =>
  [...out.querySelectorAll("button")].map((button) => button.getAttribute("tabindex"));

const drawn = (
  Component: (props: SwitchProps) => ReactElement,
  value: string,
  onChange: ((value: string) => void) | undefined,
): HTMLElement =>
  mount(
    <Component items={items} value={value} label="Range" {...(onChange ? { onChange } : {})} />,
  );

type Kind = { Component: (props: SwitchProps) => ReactElement; group: string; role: string };
const kinds: Array<[string, Kind & { selected: string }]> = [
  ["Tabs", { Component: Tabs, group: "tablist", role: "tab", selected: "aria-selected" }],
  [
    "SegmentedControl",
    { Component: SegmentedControl, group: "radiogroup", role: "radio", selected: "aria-checked" },
  ],
];

describe.each(kinds)("%s", (_name, { Component, group, role, selected }) => {
  const render = (value = "day", onChange?: (value: string) => void): HTMLElement =>
    drawn(Component, value, onChange);

  it("is a named group of buttons with the current one selected", () => {
    const out = render("week");
    expect(out.querySelector(`[role=${group}]`)?.getAttribute("aria-label")).toBe("Range");
    const buttons = [...out.querySelectorAll(`button[role=${role}]`)];
    expect(buttons.map((button) => button.getAttribute(selected))).toEqual([
      "false",
      "true",
      "false",
      "false",
    ]);
  });

  it("calls onChange with the value of a clicked option", () => {
    const onChange = vi.fn<(value: string) => void>();
    const out = render("day", onChange);
    act(() => out.querySelectorAll("button")[3]?.click());
    expect(onChange).toHaveBeenCalledExactlyOnceWith("year");
  });

  it("does not call onChange for a disabled option", () => {
    const onChange = vi.fn<(value: string) => void>();
    const out = render("day", onChange);
    const dream = out.querySelectorAll("button")[2];
    expect(dream?.getAttribute("aria-disabled")).toBe("true");
    act(() => dream?.click());
    expect(onChange).not.toHaveBeenCalled();
  });

  it("keeps a disabled option's title as its reason, in the page and out of the tab order", () => {
    const out = mount(
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
    const [a, b] = [...out.querySelectorAll("button")];
    expect(b?.getAttribute("title")).toBe("Needs a second shot");
    expect(b?.getAttribute("aria-disabled")).toBe("true");
    expect(b?.hasAttribute("disabled")).toBe(false);
    expect(b?.getAttribute("tabindex")).toBe("-1");
    expect(a?.hasAttribute("aria-disabled")).toBe(false);
  });

  it("puts a count after the label, in the accessible name", () => {
    const out = mount(
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
    expect([...out.querySelectorAll("button")].map((button) => button.textContent)).toEqual([
      "Shots 12",
      "Clips 0",
      "Notes",
    ]);
  });

  it("disables every option with the group: no tab stop, no choice, no arrow movement", () => {
    const onChange = vi.fn<(value: string) => void>();
    const out = mount(
      <Component items={items} value="day" onChange={onChange} label="Range" disabled />,
    );
    const buttons = [...out.querySelectorAll("button")];
    expect(out.querySelector(`[role=${group}]`)?.getAttribute("aria-disabled")).toBe("true");
    expect(buttons.map((button) => button.getAttribute("aria-disabled"))).toEqual([
      "true",
      "true",
      "true",
      "true",
    ]);
    expect(stops(out)).toEqual(["-1", "-1", "-1", "-1"]);
    act(() => buttons[3]?.click());
    press(buttons[0], "ArrowRight");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("gives a link option its title and count", () => {
    const out = renderToStaticMarkup(
      <Component
        label="Range"
        value="a"
        items={[{ value: "a", label: "A", href: "/a", count: 3, title: "Three of them" }]}
      />,
    );
    expect(out).toContain('title="Three of them"');
    expect(out).toContain(">3</span>");
  });

  it("gives the current option the only tab stop, or the first enabled when none is current", () => {
    expect(stops(render("week"))).toEqual(["-1", "0", "-1", "-1"]);
    unmount();
    expect(stops(render("nothing"))).toEqual(["0", "-1", "-1", "-1"]);
  });

  it("moves focus and the choice with the arrows, skipping a disabled option and wrapping", () => {
    const onChange = vi.fn<(value: string) => void>();
    const out = render("week", onChange);
    const buttons = [...out.querySelectorAll("button")];
    press(buttons[1], "ArrowRight");
    expect(onChange).toHaveBeenLastCalledWith("year");
    expect(document.activeElement).toBe(buttons[3]);
    press(buttons[3], "ArrowRight");
    expect(onChange).toHaveBeenLastCalledWith("day");
    expect(document.activeElement).toBe(buttons[0]);
    press(buttons[0], "ArrowLeft");
    expect(onChange).toHaveBeenLastCalledWith("year");
  });

  it("jumps to the first and last enabled option with Home and End", () => {
    const onChange = vi.fn<(value: string) => void>();
    const out = render("week", onChange);
    const buttons = [...out.querySelectorAll("button")];
    press(buttons[1], "End");
    expect(onChange).toHaveBeenLastCalledWith("year");
    press(buttons[3], "Home");
    expect(onChange).toHaveBeenLastCalledWith("day");
  });

  it("ignores other keys", () => {
    const onChange = vi.fn<(value: string) => void>();
    const out = render("week", onChange);
    press(out.querySelectorAll("button")[1], "a");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("draws a link option as an <a> in a nav, with aria-current on the current one", () => {
    const out = renderToStaticMarkup(
      <Component
        label="Range"
        value="a"
        items={[
          { value: "a", label: "A", href: "/a" },
          { value: "b", label: "B", href: "https://b.example", external: true },
        ]}
      />,
    );
    expect(out).toContain('<nav aria-label="Range"');
    expect(out).toMatch(/<a href="\/a"[^>]*aria-current="page"/);
    expect(out.match(/aria-current="page"/g)).toHaveLength(1);
    expect(out).toContain('target="_blank"');
    expect(out).not.toContain("<button");
  });

  it("draws a link option with the app's own Link through render, and no href", () => {
    const out = renderToStaticMarkup(
      <Component
        label="Range"
        value="a"
        items={[
          { value: "a", label: "A", render: (p) => <Link to="/a" {...p} /> },
          { value: "b", label: "B", render: (p) => <Link to="/b" {...p} /> },
        ]}
      />,
    );
    expect(out).toContain('data-to="/a"');
    expect(out).toContain('data-to="/b"');
    expect(out).not.toContain("href=");
    expect(out).toMatch(
      /data-to="\/a"[^>]*aria-current="page"|aria-current="page"[^>]*data-to="\/a"/,
    );
    expect(out.match(/aria-current="page"/g)).toHaveLength(1);
  });
});

describe("Tabs", () => {
  it("underlines the current tab in the accent over a bottom rule", () => {
    const out = renderToStaticMarkup(
      <Tabs items={items} value="day" onChange={() => {}} label="Range" />,
    );
    expect(out).toContain("border-b border-slate-200");
    expect(out.match(/border-violet-600/g)).toHaveLength(1);
    expect(out.match(/border-transparent/g)).toHaveLength(3);
  });

  it("fills the current tab as a pill, with no rule, for variant=pill", () => {
    const out = renderToStaticMarkup(
      <Tabs items={items} value="day" onChange={() => {}} label="Range" variant="pill" />,
    );
    expect(out).not.toContain("border-b");
    expect(out).toContain("rounded-lg");
    expect(out.match(/bg-slate-100 font-medium text-slate-900/g)).toHaveLength(1);
    expect(out.match(/hover:bg-slate-100/g)).toHaveLength(2);
  });

  it("gives a disabled tab no hover look, in both variants", () => {
    for (const variant of ["underline", "pill"] as const) {
      const out = mount(
        <Tabs
          items={[
            { value: "a", label: "A" },
            { value: "b", label: "B", disabled: true },
          ]}
          value="a"
          onChange={() => {}}
          label="Range"
          variant={variant}
        />,
      );
      const [, b] = [...out.querySelectorAll("button")];
      expect(b?.className).not.toContain("hover:");
      expect(b?.className).toContain("opacity-50");
      unmount();
    }
  });

  it("points a tab at its panel with controls", () => {
    const out = renderToStaticMarkup(
      <Tabs
        items={[{ value: "a", label: "A", controls: "panel-a" }]}
        value="a"
        onChange={() => {}}
        label="Range"
      />,
    );
    expect(out).toContain('aria-controls="panel-a"');
  });
});

describe("SegmentedControl", () => {
  it("fills the current option and rounds the joined group", () => {
    const out = renderToStaticMarkup(
      <SegmentedControl items={items} value="day" onChange={() => {}} label="Range" />,
    );
    expect(out).toContain("rounded-full border border-slate-300");
    expect(out.match(/bg-violet-600/g)).toHaveLength(1);
    expect(out.match(/bg-white/g)).toHaveLength(3);
  });

  it("moves with the vertical arrows too", () => {
    const onChange = vi.fn<(value: string) => void>();
    const out = mount(
      <SegmentedControl items={items} value="day" onChange={onChange} label="Range" />,
    );
    press(out.querySelectorAll("button")[0], "ArrowDown");
    expect(onChange).toHaveBeenLastCalledWith("week");
  });
});
