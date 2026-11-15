// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { Code } from "./Code.js";
import { render, screen } from "./render.harness.js";

describe("Code", () => {
  it("is an inline code element holding its text", () => {
    render(<Code>bun install</Code>);
    expect(screen.getByRole("code").textContent).toBe("bun install");
  });

  it("passes a title through", () => {
    render(<Code title="command">x</Code>);
    expect(screen.getByRole("code").getAttribute("title")).toBe("command");
  });
});
