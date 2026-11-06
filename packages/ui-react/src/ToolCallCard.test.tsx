// @vitest-environment jsdom
import { act } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { mount, unmount } from "./dom.harness.js";
import { ToolCallCard } from "./ToolCallCard.js";

afterEach(unmount);

describe("ToolCallCard", () => {
  it.each([
    ["running", "Running", "bg-slate-100"],
    ["done", "Done", "bg-emerald-50"],
    ["error", "Failed", "bg-red-50"],
  ] as const)("says %s in a word on the summary line, in its Pill tone", (status, word, fill) => {
    const root = mount(
      <ToolCallCard name="search_recipes" status={status} summary="Three found">
        Result
      </ToolCallCard>,
    );
    const line = root.querySelector("button")!;
    expect(line.textContent).toContain("search_recipes");
    expect(line.textContent).toContain("Three found");
    expect(line.querySelector(`.${fill}`)?.textContent).toBe(word);
  });

  it("sets the name in the monospace face and truncates the summary", () => {
    const root = mount(
      <ToolCallCard name="search_recipes" status="done" summary="Three found">
        Result
      </ToolCallCard>,
    );
    const spans = Array.from(root.querySelectorAll("button span"));
    expect(spans.find((el) => el.textContent === "search_recipes")?.className).toContain(
      "font-mono",
    );
    expect(spans.find((el) => el.textContent === "Three found")?.className).toContain("truncate");
  });

  it("starts closed, as a bordered panel, and opens to show the body", () => {
    const root = mount(
      <ToolCallCard name="search_recipes" status="done">
        Result
      </ToolCallCard>,
    );
    const line = root.querySelector("button")!;
    expect(root.firstElementChild?.className).toContain("border-slate-200/70");
    expect(line.getAttribute("aria-expanded")).toBe("false");
    act(() => line.click());
    expect(line.getAttribute("aria-expanded")).toBe("true");
    expect(root.textContent).toContain("Result");
  });
});
