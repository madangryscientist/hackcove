// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { Field } from "./Field.js";
import { follows, render, screen } from "./render.harness.js";

const HINT = "Shown on your reviews.";
const ERROR = "Pick a shorter name.";

describe("Field", () => {
  it("points the label at the control through htmlFor", () => {
    render(
      <Field label="Name" htmlFor="name">
        <input id="name" />
      </Field>,
    );
    expect(screen.getByRole("textbox", { name: "Name" }).id).toBe("name");
  });

  it("shows the hint when there is no error", () => {
    render(
      <Field label="Name" htmlFor="name" hint={HINT}>
        <input id="name" />
      </Field>,
    );
    expect(screen.getByText(HINT)).toBeInstanceOf(HTMLElement);
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("replaces the hint with an error that is an alert", () => {
    render(
      <Field label="Name" htmlFor="name" hint={HINT} error={ERROR}>
        <input id="name" />
      </Field>,
    );
    expect(screen.getByRole("alert").textContent).toBe(ERROR);
    expect(screen.queryByText(HINT)).toBeNull();
  });
});

describe("Field layout", () => {
  it("still names the control and puts the label before it with layout=row", () => {
    render(
      <Field label="Rank" htmlFor="rank" layout="row">
        <input id="rank" />
      </Field>,
    );
    const input = screen.getByRole("textbox", { name: "Rank" });
    expect(follows(screen.getByText("Rank"), input)).toBe(true);
  });

  it("keeps the hint after the control, and the error in its place, with layout=row", () => {
    const { unmount } = render(
      <Field label="Rank" htmlFor="rank" layout="row" hint="Lower first.">
        <input id="rank" />
      </Field>,
    );
    const input = screen.getByRole("textbox", { name: "Rank" });
    expect(follows(input, screen.getByText("Lower first."))).toBe(true);
    unmount();
    render(
      <Field label="Rank" htmlFor="rank" layout="row" hint="Lower first." error="Required.">
        <input id="rank" />
      </Field>,
    );
    expect(screen.getByRole("alert").textContent).toBe("Required.");
    expect(screen.queryByText("Lower first.")).toBeNull();
  });
});
