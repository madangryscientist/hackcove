// @vitest-environment jsdom
import { act } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { mount, unmount } from "./dom.harness.js";
import { Radio, RadioGroup } from "./RadioGroup.js";

afterEach(unmount);

const scope = (
  props: Partial<Parameters<typeof RadioGroup>[0]> = {},
  last: { description?: string; isDisabled?: boolean } = {},
) =>
  mount(
    <RadioGroup label="Scope" {...props}>
      <Radio value="file" label="This file" description="Only the file you opened." />
      <Radio value="folder" label="This folder" />
      <Radio value="all" label="Everything" {...last} />
    </RadioGroup>,
  );

const radios = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLInputElement>('input[type="radio"]'));

const at = (container: HTMLElement, index: number) => {
  const input = radios(container)[index];
  if (!input) throw new Error(`no radio at ${index}`);
  return input;
};

const press = (target: Element, key: string) =>
  act(() => {
    target.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }));
  });

describe("RadioGroup selection", () => {
  it("is a radiogroup named by its label, with a radio per option and nothing chosen", () => {
    const container = scope();
    const group = container.querySelector('[role="radiogroup"]');
    expect(group).not.toBeNull();
    const name = document.getElementById(group?.getAttribute("aria-labelledby") ?? "");
    expect(name?.textContent).toBe("Scope");
    expect(radios(container).map((r) => r.value)).toEqual(["file", "folder", "all"]);
    expect(radios(container).some((r) => r.checked)).toBe(false);
  });

  it("starts on defaultValue and keeps the choice the person makes", () => {
    const onChange = vi.fn<(value: string) => void>();
    const container = scope({ defaultValue: "folder", onChange });
    expect(radios(container).map((r) => r.checked)).toEqual([false, true, false]);
    act(() => radios(container)[2]?.click());
    expect(radios(container).map((r) => r.checked)).toEqual([false, false, true]);
    expect(onChange).toHaveBeenCalledExactlyOnceWith("all");
  });

  it("follows a controlled value and only reports the click", () => {
    const onChange = vi.fn<(value: string) => void>();
    const container = scope({ value: "file", onChange });
    act(() => radios(container)[1]?.click());
    expect(onChange).toHaveBeenCalledExactlyOnceWith("folder");
    expect(radios(container).map((r) => r.checked)).toEqual([true, false, false]);
  });

  it("chooses by a click on the label text", () => {
    const container = scope({ defaultValue: "file" });
    const text = Array.from(container.querySelectorAll("span")).find(
      (s) => s.textContent === "Everything",
    );
    act(() => text?.click());
    expect(radios(container)[2]?.checked).toBe(true);
  });

  it("posts the choice under name", () => {
    const container = scope({ name: "scope", defaultValue: "all" });
    expect(radios(container).every((r) => r.name === "scope")).toBe(true);
  });

  it("does not choose a disabled radio", () => {
    const container = scope({}, { isDisabled: true });
    expect(radios(container)[2]?.disabled).toBe(true);
    act(() => radios(container)[2]?.click());
    expect(radios(container).some((r) => r.checked)).toBe(false);
  });

  it("disables every radio with isDisabled on the group", () => {
    const container = scope({ isDisabled: true });
    expect(radios(container).every((r) => r.disabled)).toBe(true);
  });
});

describe("RadioGroup keyboard", () => {
  it("is one tab stop once a radio is chosen: the chosen one", () => {
    const container = scope({ defaultValue: "folder" });
    expect(radios(container).map((r) => r.tabIndex)).toEqual([-1, 0, -1]);
  });

  it("moves the choice with the arrow keys, wrapping at each end", () => {
    const container = scope({ defaultValue: "file" });
    const [file, folder, all] = [at(container, 0), at(container, 1), at(container, 2)];
    act(() => file.focus());
    press(file, "ArrowDown");
    expect(document.activeElement).toBe(folder);
    expect(radios(container).map((r) => r.checked)).toEqual([false, true, false]);
    press(folder, "ArrowRight");
    expect(radios(container).map((r) => r.checked)).toEqual([false, false, true]);
    press(all, "ArrowDown");
    expect(radios(container).map((r) => r.checked)).toEqual([true, false, false]);
    press(file, "ArrowUp");
    expect(radios(container).map((r) => r.checked)).toEqual([false, false, true]);
  });

  it("skips a disabled radio", () => {
    const container = scope({ defaultValue: "folder" }, { isDisabled: true });
    const folder = at(container, 1);
    act(() => folder.focus());
    press(folder, "ArrowDown");
    expect(radios(container).map((r) => r.checked)).toEqual([true, false, false]);
  });
});

describe("RadioGroup description and error", () => {
  it("describes an option by its description, and only that option", () => {
    const container = scope();
    const [file, folder] = radios(container);
    const id = file?.getAttribute("aria-describedby") ?? "";
    expect(document.getElementById(id)?.textContent).toBe("Only the file you opened.");
    expect(folder?.getAttribute("aria-describedby")).toBeNull();
    expect(
      container.querySelector('[role="radiogroup"]')?.getAttribute("aria-describedby"),
    ).toBeNull();
  });

  it("draws no error line and no invalid mark without an error", () => {
    const container = scope();
    expect(container.querySelector('[role="alert"]')).toBeNull();
    expect(container.querySelector('[aria-invalid="true"]')).toBeNull();
  });

  it("shows an error as role=alert, marks the group invalid and describes the group by it", () => {
    const container = scope({ error: "Pick a scope." });
    const alert = container.querySelector('[role="alert"]');
    expect(alert?.textContent).toBe("Pick a scope.");
    expect(alert?.parentElement?.className).toContain("text-red-700");
    const group = container.querySelector('[role="radiogroup"]');
    expect(group?.getAttribute("aria-invalid")).toBe("true");
    const described = group?.getAttribute("aria-describedby") ?? "";
    expect(described.split(" ").some((id) => document.getElementById(id)?.contains(alert))).toBe(
      true,
    );
  });

  it("passes data-* and aria-describedby through to the group", () => {
    const container = scope({ "data-testid": "scope", "aria-describedby": "extra" });
    const group = container.querySelector('[data-testid="scope"]');
    expect(group?.getAttribute("role")).toBe("radiogroup");
    expect(group?.getAttribute("aria-describedby")).toContain("extra");
  });
});
