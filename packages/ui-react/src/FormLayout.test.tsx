// @vitest-environment jsdom
import type { FormEvent } from "react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./Button.js";
import { Field } from "./Field.js";
import { Input } from "./Input.js";
import { FormLayout } from "./PageLayouts.js";
import { render, screen, user } from "./render.harness.js";

const follows = (a: Node, b: Node) =>
  Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);

describe("FormLayout error", () => {
  it("announces the error after the fields and before the actions", () => {
    render(
      <FormLayout
        title="Settings"
        error="Could not save."
        actions={<Button type="submit">Save</Button>}
      >
        <Field label="Name">
          <Input />
        </Field>
      </FormLayout>,
    );
    const alert = screen.getByRole("alert");
    expect(alert.textContent).toBe("Could not save.");
    expect(follows(screen.getByRole("textbox", { name: "Name" }), alert)).toBe(true);
    expect(follows(alert, screen.getByRole("button", { name: "Save" }))).toBe(true);
  });

  it("submits on Enter in a field", async () => {
    const onSubmit = vi.fn<(event: FormEvent<HTMLFormElement>) => void>((event) => {
      event.preventDefault();
    });
    render(
      <FormLayout
        title="Settings"
        onSubmit={onSubmit}
        actions={<Button type="submit">Save</Button>}
      >
        <Field label="Name">
          <Input />
        </Field>
      </FormLayout>,
    );
    await user().type(screen.getByRole("textbox", { name: "Name" }), "Ada{Enter}");
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("alert")).toBeNull();
  });
});
