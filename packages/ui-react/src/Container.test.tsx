// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { Container } from "./Container.js";
import { render, screen } from "./render.harness.js";

describe("Container", () => {
  it("renders the element `as` names: main is the main landmark", () => {
    render(<Container as="main">x</Container>);
    expect(screen.getByRole("main").textContent).toBe("x");
  });

  it("is no landmark by default", () => {
    render(<Container>x</Container>);
    expect(screen.queryByRole("main")).toBeNull();
    expect(screen.getByText("x").tagName).toBe("DIV");
  });
});
