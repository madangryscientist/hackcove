// @vitest-environment jsdom
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Input } from "./Input.js";
import { follows, render, screen, user } from "./render.harness.js";

const icon = "search";

describe("Input", () => {
  it("is a text field named by its label", () => {
    render(<Input aria-label="Name" />);
    expect(screen.getByRole("textbox", { name: "Name" })).toBeInstanceOf(HTMLInputElement);
  });

  it("passes placeholder, type and disabled through with an icon", () => {
    render(<Input type="search" placeholder="Search" disabled icon={icon} aria-label="Find" />);
    const field = screen.getByRole<HTMLInputElement>("searchbox", { name: "Find" });
    expect(field.type).toBe("search");
    expect(field.placeholder).toBe("Search");
    expect(field.disabled).toBe(true);
  });
});

/** The search field's clear button, or null while there is none. */
const clear = () => screen.queryByRole<HTMLButtonElement>("button", { name: "Clear search" });

function Controlled() {
  const [value, setValue] = useState("tea");
  return (
    <Input
      type="search"
      aria-label="Find"
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}

describe("Input clear button", () => {
  it("is absent when a search field is empty", () => {
    render(<Input type="search" aria-label="Find" />);
    expect(clear()).toBeNull();
  });

  it("is absent on a field that is not a search", () => {
    render(<Input defaultValue="x" aria-label="Name" />);
    expect(clear()).toBeNull();
  });

  it("is absent when disabled", () => {
    render(<Input type="search" defaultValue="x" disabled aria-label="Find" />);
    expect(clear()).toBeNull();
  });

  it("is absent when read-only", () => {
    render(<Input type="search" defaultValue="x" readOnly aria-label="Find" />);
    expect(clear()).toBeNull();
  });

  it("clears an uncontrolled field, fires onChange, returns focus to the input and goes away", async () => {
    const onChange = vi.fn<() => void>();
    render(<Input type="search" defaultValue="tea" aria-label="Find" onChange={onChange} />);
    const button = screen.getByRole<HTMLButtonElement>("button", { name: "Clear search" });
    expect(button.type).toBe("button");
    await user().click(button);
    const field = screen.getByRole<HTMLInputElement>("searchbox", { name: "Find" });
    expect(field.value).toBe("");
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(field);
    expect(clear()).toBeNull();
  });

  it("clears a controlled field through its onChange", async () => {
    render(<Controlled />);
    await user().click(screen.getByRole("button", { name: "Clear search" }));
    expect(screen.getByRole<HTMLInputElement>("searchbox", { name: "Find" }).value).toBe("");
    expect(clear()).toBeNull();
  });

  it("appears once an uncontrolled field is typed into", async () => {
    render(<Input type="search" aria-label="Find" />);
    await user().type(screen.getByRole("searchbox", { name: "Find" }), "t");
    expect(clear()).not.toBeNull();
  });
});

describe("Input prefix", () => {
  it("reads the prefix before the field", () => {
    render(<Input prefix="R" aria-label="Amount" />);
    expect(follows(screen.getByText("R"), screen.getByRole("textbox", { name: "Amount" }))).toBe(
      true,
    );
  });

  it("keeps the field's own props", () => {
    render(<Input prefix="R" size="sm" width="md" name="amount" disabled aria-label="Amount" />);
    const field = screen.getByRole<HTMLInputElement>("textbox", { name: "Amount" });
    expect(field.name).toBe("amount");
    expect(field.disabled).toBe(true);
  });
});
