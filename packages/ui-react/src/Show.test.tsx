// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen, within } from "./render.harness.js";
import { Show } from "./Show.js";
import { Text } from "./typography.js";

describe("Show", () => {
  it("renders its children once", () => {
    render(
      <Show from="sm">
        <button type="button">Export</button>
      </Show>,
    );
    expect(screen.getAllByRole("button", { name: "Export" })).toHaveLength(1);
  });

  it('as="span" sits inside a paragraph', () => {
    render(
      <Text>
        Press{" "}
        <Show below="md" as="span">
          Enter
        </Show>{" "}
        to send
      </Text>,
    );
    const paragraph = screen.getByRole("paragraph");
    expect(within(paragraph).getByText("Enter")).toBeTruthy();
    expect(paragraph.textContent).toBe("Press Enter to send");
  });

  it("takes exactly one of from or below", () => {
    type P = Parameters<typeof Show>[0];
    // @ts-expect-error both from and below
    const both: P = { from: "sm", below: "lg", children: "x" };
    // @ts-expect-error neither from nor below
    const neither: P = { children: "x" };
    // @ts-expect-error no xl step
    const xl: P = { from: "xl", children: "x" };
    expect([both, neither, xl]).toHaveLength(3);
  });
});
