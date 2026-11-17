// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { render, screen, user, within } from "./render.harness.js";
import { Select } from "./Select.js";

const ITEMS = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta" },
];

const select = () => screen.getByRole<HTMLSelectElement>("combobox", { name: "Plan" });

describe("Select", () => {
  it("renders an option per item, named by its label and carrying its value", () => {
    render(<Select items={ITEMS} aria-label="Plan" />);
    const options = within(select()).getAllByRole<HTMLOptionElement>("option");
    expect(options.map((o) => [o.value, o.textContent])).toEqual([
      ["a", "Alpha"],
      ["b", "Beta"],
    ]);
  });

  it("passes value and disabled through", () => {
    render(<Select items={ITEMS} value="b" disabled onChange={() => {}} aria-label="Plan" />);
    expect(select().disabled).toBe(true);
    expect(select().value).toBe("b");
  });

  it("passes defaultValue through", () => {
    render(<Select items={ITEMS} defaultValue="b" aria-label="Plan" />);
    expect(select().value).toBe("b");
  });

  it("reports the option a person picks", async () => {
    const onChange = vi.fn<(value: string) => void>();
    render(<Select items={ITEMS} aria-label="Plan" onChange={(e) => onChange(e.target.value)} />);
    await user().selectOptions(select(), "Beta");
    expect(onChange).toHaveBeenCalledExactlyOnceWith("b");
  });
});
