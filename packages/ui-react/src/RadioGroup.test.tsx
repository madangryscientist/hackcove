// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { Radio, RadioGroup } from "./RadioGroup.js";
import { render, screen, user } from "./render.harness.js";

const scope = (
  props: Partial<Parameters<typeof RadioGroup>[0]> = {},
  last: { description?: string; isDisabled?: boolean } = {},
) =>
  render(
    <RadioGroup label="Scope" {...props}>
      <Radio value="file" label="This file" description="Only the file you opened." />
      <Radio value="folder" label="This folder" />
      <Radio value="all" label="Everything" {...last} />
    </RadioGroup>,
  );

/**
 * A radio by its label, as the input it is. The label wraps the description too, so the first
 * radio's name runs on into it; it is matched by how it starts.
 */
function radio(label: string): HTMLInputElement {
  const name = new RegExp(`^${label}`);
  const found = screen.getByRole("radio", { name });
  if (!(found instanceof HTMLInputElement)) throw new Error(`${label} is not an input`);
  return found;
}

const radios = () => ["This file", "This folder", "Everything"].map(radio);
const chosen = () => radios().map((r) => r.checked);

describe("RadioGroup selection", () => {
  it("is a radiogroup named by its label, with a radio per option and nothing chosen", () => {
    scope();
    expect(screen.getByRole("radiogroup", { name: "Scope" })).not.toBeNull();
    expect(radios().map((r) => r.value)).toEqual(["file", "folder", "all"]);
    expect(chosen()).toEqual([false, false, false]);
  });

  it("starts on defaultValue and keeps the choice the person makes", async () => {
    const onChange = vi.fn<(value: string) => void>();
    scope({ defaultValue: "folder", onChange });
    expect(chosen()).toEqual([false, true, false]);
    await user().click(radio("Everything"));
    expect(chosen()).toEqual([false, false, true]);
    expect(onChange).toHaveBeenCalledExactlyOnceWith("all");
  });

  it("follows a controlled value and only reports the click", async () => {
    const onChange = vi.fn<(value: string) => void>();
    scope({ value: "file", onChange });
    await user().click(radio("This folder"));
    expect(onChange).toHaveBeenCalledExactlyOnceWith("folder");
    expect(chosen()).toEqual([true, false, false]);
  });

  it("chooses by a click on the label text", async () => {
    scope({ defaultValue: "file" });
    await user().click(screen.getByText("Everything"));
    expect(radio("Everything").checked).toBe(true);
  });

  it("posts the choice under name", () => {
    scope({ name: "scope", defaultValue: "all" });
    expect(radios().map((r) => r.name)).toEqual(["scope", "scope", "scope"]);
  });

  it("does not choose a disabled radio", async () => {
    scope({}, { isDisabled: true });
    expect(radio("Everything").disabled).toBe(true);
    await user().click(screen.getByText("Everything"));
    expect(chosen()).toEqual([false, false, false]);
  });

  it("disables every radio with isDisabled on the group", () => {
    scope({ isDisabled: true });
    expect(radios().map((r) => r.disabled)).toEqual([true, true, true]);
  });
});

describe("RadioGroup keyboard", () => {
  it("is one tab stop once a radio is chosen: the chosen one", async () => {
    scope({ defaultValue: "folder" });
    await user().tab();
    expect(document.activeElement).toBe(radio("This folder"));
    expect(radios().map((r) => r.tabIndex)).toEqual([-1, 0, -1]);
  });

  it("moves the choice with the arrow keys, wrapping at each end", async () => {
    scope({ defaultValue: "file" });
    const person = user();
    await person.tab();
    expect(document.activeElement).toBe(radio("This file"));
    await person.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(radio("This folder"));
    expect(chosen()).toEqual([false, true, false]);
    await person.keyboard("{ArrowRight}");
    expect(chosen()).toEqual([false, false, true]);
    await person.keyboard("{ArrowDown}");
    expect(chosen()).toEqual([true, false, false]);
    await person.keyboard("{ArrowUp}");
    expect(chosen()).toEqual([false, false, true]);
  });

  it("skips a disabled radio", async () => {
    scope({ defaultValue: "folder" }, { isDisabled: true });
    const person = user();
    await person.tab();
    await person.keyboard("{ArrowDown}");
    expect(chosen()).toEqual([true, false, false]);
  });
});

describe("RadioGroup description and error", () => {
  it("describes an option by its description, and only that option", () => {
    scope();
    expect(
      screen.getByRole("radio", { name: /^This file/, description: "Only the file you opened." }),
    ).not.toBeNull();
    expect(radio("This folder").hasAttribute("aria-describedby")).toBe(false);
    expect(screen.getByRole("radiogroup", { name: "Scope" }).hasAttribute("aria-describedby")).toBe(
      false,
    );
  });

  it("draws no error line and no invalid mark without an error", () => {
    scope();
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.getByRole("radiogroup", { name: "Scope" }).hasAttribute("aria-invalid")).toBe(
      false,
    );
  });

  it("shows an error as role=alert, marks the group invalid and describes the group by it", () => {
    scope({ error: "Pick a scope." });
    expect(screen.getByRole("alert").textContent).toBe("Pick a scope.");
    const group = screen.getByRole("radiogroup", { name: "Scope", description: "Pick a scope." });
    expect(group.getAttribute("aria-invalid")).toBe("true");
  });
});
