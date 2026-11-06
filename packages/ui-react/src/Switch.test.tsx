// @vitest-environment jsdom
import { renderToStaticMarkup } from "react-dom/server";
import { act } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { mount, unmount } from "./dom.harness.js";
import { Switch } from "./Switch.js";

const noop = () => undefined;

/** The track's height and width classes at a size. */
const track = (size?: "sm" | "md" | "lg") =>
  renderToStaticMarkup(<Switch label="L" size={size} checked={false} onChange={noop} />).match(
    /<button[^>]*class="[^"]*(h-\d+ w-\d+)/,
  )?.[1];

/** The one switch in the mounted tree. */
function switchOf(container: HTMLElement): HTMLButtonElement {
  const found = container.querySelector<HTMLButtonElement>('[role="switch"]');
  if (found === null) throw new Error("no switch rendered");
  return found;
}

describe("Switch", () => {
  afterEach(unmount);

  it("is a native button with role switch, and aria-checked is the caller's value", () => {
    const off = switchOf(mount(<Switch label="Live" checked={false} onChange={noop} />));
    expect(off.tagName).toBe("BUTTON");
    expect(off.getAttribute("type")).toBe("button");
    expect(off.getAttribute("aria-checked")).toBe("false");
    unmount();
    expect(
      switchOf(mount(<Switch label="Live" checked onChange={noop} />)).getAttribute("aria-checked"),
    ).toBe("true");
  });

  it("calls onChange with the next value, and does not flip by itself", () => {
    const onChange = vi.fn<(checked: boolean) => void>();
    const off = switchOf(mount(<Switch label="Live" checked={false} onChange={onChange} />));
    act(() => off.click());
    expect(onChange).toHaveBeenLastCalledWith(true);
    expect(off.getAttribute("aria-checked")).toBe("false");
    unmount();

    const on = switchOf(mount(<Switch label="Live" checked onChange={onChange} />));
    act(() => on.click());
    expect(onChange).toHaveBeenLastCalledWith(false);
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it("clicking the label flips it once", () => {
    const onChange = vi.fn<(checked: boolean) => void>();
    const container = mount(<Switch label="Live" checked={false} onChange={onChange} />);
    const text = Array.from(container.querySelectorAll("span")).find(
      (el) => el.textContent === "Live",
    );
    act(() => text?.click());
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("busy ignores a click, keeps aria-busy and stays focusable", () => {
    const onChange = vi.fn<(checked: boolean) => void>();
    const busy = switchOf(mount(<Switch label="Live" checked busy onChange={onChange} />));
    act(() => busy.click());
    expect(onChange).not.toHaveBeenCalled();
    expect(busy.getAttribute("aria-busy")).toBe("true");
    expect(busy.getAttribute("aria-disabled")).toBe("true");
    expect(busy.disabled).toBe(false);
    busy.focus();
    expect(document.activeElement).toBe(busy);
    expect(busy.className).toContain("bg-violet-600");
  });

  it("is not busy by default: no aria-busy, no aria-disabled", () => {
    const out = renderToStaticMarkup(<Switch label="Live" checked onChange={noop} />);
    expect(out).not.toContain("aria-busy");
    expect(out).not.toContain("aria-disabled");
  });

  it("disabled is the native attribute and washes the switch out", () => {
    const onChange = vi.fn<(checked: boolean) => void>();
    const container = mount(<Switch label="Live" checked disabled onChange={onChange} />);
    const disabled = switchOf(container);
    expect(disabled.disabled).toBe(true);
    act(() => disabled.click());
    expect(onChange).not.toHaveBeenCalled();
    expect(container.querySelector("label")?.className).toContain("opacity-50");
  });

  it("a description is the switch's aria-describedby, and keeps a caller's", () => {
    const out = renderToStaticMarkup(
      <Switch label="Live" description="Serves all traffic" checked onChange={noop} />,
    );
    const id = out.match(/aria-describedby="([^"]+)"/)?.[1];
    expect(id).toBeTruthy();
    expect(out).toMatch(new RegExp(`<span id="${id}" class="text-xs text-slate-500">Serves all`));
    expect(out.indexOf("Live")).toBeLessThan(out.indexOf("Serves all traffic"));
    expect(out).toMatch(/<label[^>]*class="[^"]*items-start/);

    const merged = renderToStaticMarkup(
      <Switch label="L" description="D" aria-describedby="other" checked onChange={noop} />,
    );
    expect(merged).toMatch(/aria-describedby="other [^"]+"/);

    const plain = renderToStaticMarkup(<Switch label="L" checked onChange={noop} />);
    expect(plain).not.toContain("aria-describedby");
    expect(plain).toMatch(/<label[^>]*class="[^"]*items-center/);
  });

  it("a bare switch is named by aria-label and has no label element", () => {
    const out = renderToStaticMarkup(
      <Switch aria-label="Live in staging" checked onChange={noop} />,
    );
    expect(out).not.toContain("<label");
    expect(out).toContain('aria-label="Live in staging"');
  });

  it("the three sizes change the track, and md is the default", () => {
    expect(track("sm")).toBe("h-5 w-9");
    expect(track()).toBe("h-6 w-11");
    expect(track("md")).toBe("h-6 w-11");
    expect(track("lg")).toBe("h-7 w-13");
  });

  it("off is an outline in text-slate-500 and on is the accent fill with a pale thumb", () => {
    const off = renderToStaticMarkup(<Switch label="L" checked={false} onChange={noop} />);
    expect(off).toMatch(/<button[^>]*class="[^"]*border-current text-slate-500/);
    expect(off).not.toContain("bg-violet-600");
    expect(off).toContain("bg-current");
    const on = renderToStaticMarkup(<Switch label="L" checked onChange={noop} />);
    expect(on).toMatch(/<button[^>]*class="[^"]*bg-violet-600 text-violet-50/);
    expect(on).not.toContain("border-current");
    expect(on).toContain("bg-current");
    expect(on).not.toContain("dark:");
    expect(on).toContain("motion-reduce:transition-none");
  });

  it("passes other button props through and calls the caller's onClick first", () => {
    const calls: string[] = [];
    const container = mount(
      <Switch
        label="Live"
        checked={false}
        onChange={() => calls.push("change")}
        onClick={() => calls.push("click")}
        name="live"
        id="live-switch"
        data-testid="probe"
      />,
    );
    const button = switchOf(container);
    expect(button.id).toBe("live-switch");
    expect(button.getAttribute("name")).toBe("live");
    expect(button.getAttribute("data-testid")).toBe("probe");
    act(() => button.click());
    expect(calls).toEqual(["click", "change"]);
  });

  it("a caller's onClick can stop the change with preventDefault", () => {
    const onChange = vi.fn<(checked: boolean) => void>();
    const button = switchOf(
      mount(
        <Switch
          label="Live"
          checked={false}
          onChange={onChange}
          onClick={(event) => event.preventDefault()}
        />,
      ),
    );
    act(() => button.click());
    expect(onChange).not.toHaveBeenCalled();
  });
});
