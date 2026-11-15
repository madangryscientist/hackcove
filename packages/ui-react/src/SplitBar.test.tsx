// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "./render.harness.js";
import { SplitBar } from "./SplitBar.js";

describe("SplitBar", () => {
  it("is an image named by its label and both percentages", () => {
    render(<SplitBar a={300} b={700} label="Pot split" />);
    expect(screen.getByRole("img", { name: "Pot split: 30% / 70%" })).not.toBeNull();
  });

  it("names each side when given names", () => {
    render(<SplitBar a={35} b={65} label="Pot split" names={["Debt", "Renos"]} />);
    expect(screen.getByRole("img", { name: "Pot split: Debt 35%, Renos 65%" })).not.toBeNull();
  });

  it("always adds up to 100", () => {
    render(<SplitBar a={1} b={7} label="x" />);
    expect(screen.getByRole("img", { name: "x: 13% / 87%" })).not.toBeNull();
  });

  it("never announces a side as 0% or 100% unless it truly is", () => {
    render(<SplitBar a={1} b={999} label="x" />);
    expect(screen.getByRole("img", { name: "x: 1% / 99%" })).not.toBeNull();
  });

  it("announces 0% for both sides when both are zero", () => {
    render(<SplitBar a={0} b={0} label="x" />);
    expect(screen.getByRole("img", { name: "x: 0% / 0%" })).not.toBeNull();
  });

  it("announces 0% and 100% when one side has everything", () => {
    render(<SplitBar a={0} b={5} label="x" />);
    expect(screen.getByRole("img", { name: "x: 0% / 100%" })).not.toBeNull();
  });
});
