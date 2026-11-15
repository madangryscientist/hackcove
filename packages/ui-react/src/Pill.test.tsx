// @vitest-environment jsdom
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import { Pill } from "./Pill.js";
import { render, screen, user, within } from "./render.harness.js";

const follows = (a: Node, b: Node) =>
  a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING;

describe("Pill label", () => {
  it("reads label: value, the colon there for a screen reader", () => {
    render(
      <Pill name="Weight" tone="warn">
        72 kg
      </Pill>,
    );
    const label = screen.getByText("Weight");
    const colon = screen.getByText(":");
    expect(follows(label, colon)).toBeTruthy();
    expect(follows(colon, screen.getByText("72 kg"))).toBeTruthy();
  });

  it("makes the whole label: value pill one link", () => {
    render(
      <Pill name="Sleep" href="/sleep">
        7 h
      </Pill>,
    );
    const link = screen.getByRole("link");
    expect(link.getAttribute("href")).toBe("/sleep");
    expect(within(link).getByText("Sleep")).not.toBeNull();
    expect(within(link).getByText("7 h")).not.toBeNull();
  });
});

describe("Pill onRemove", () => {
  it("adds an x button named and titled by removeLabel after the text", () => {
    render(
      <Pill onRemove={() => undefined} removeLabel="Remove invoice.pdf" tone="info">
        invoice.pdf
      </Pill>,
    );
    const remove = screen.getByRole("button", { name: "Remove invoice.pdf" });
    expect(remove.getAttribute("title")).toBe("Remove invoice.pdf");
    expect(remove.getAttribute("type")).toBe("button");
    expect(follows(screen.getByText("invoice.pdf"), remove)).toBeTruthy();
  });

  it("has no x without onRemove", () => {
    render(<Pill>x</Pill>);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("calls onRemove on a click of the x only", async () => {
    const onRemove = vi.fn<() => void>();
    render(
      <Pill onRemove={onRemove} removeLabel="Remove it">
        chip
      </Pill>,
    );
    await user().click(screen.getByText("chip"));
    expect(onRemove).not.toHaveBeenCalled();
    await user().click(screen.getByRole("button", { name: "Remove it" }));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it("sits beside a button pill, never nested in it", async () => {
    const onClick = vi.fn<() => void>();
    render(
      <Pill onClick={onClick} onRemove={() => undefined} removeLabel="Remove">
        open
      </Pill>,
    );
    const open = screen.getByRole("button", { name: "open" });
    expect(screen.getAllByRole("button")).toHaveLength(2);
    expect(within(open).queryByRole("button")).toBeNull();
    await user().click(open);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("sits beside a link pill, never nested in it", () => {
    render(
      <Pill href="/a.pdf" onRemove={() => undefined} removeLabel="Remove">
        a.pdf
      </Pill>,
    );
    const link = screen.getByRole("link", { name: "a.pdf" });
    expect(link.getAttribute("href")).toBe("/a.pdf");
    expect(within(link).queryByRole("button")).toBeNull();
    expect(follows(link, screen.getByRole("button", { name: "Remove" }))).toBeTruthy();
  });

  it("puts the title on a plain pill, around its text and its x", () => {
    render(
      <Pill onRemove={() => undefined} removeLabel="Remove" title="T">
        x
      </Pill>,
    );
    const pill = screen.getByTitle("T");
    expect(within(pill).getByText("x")).not.toBeNull();
    expect(within(pill).getByRole("button", { name: "Remove" })).not.toBeNull();
  });

  it("combines with label: the x reads after the value", () => {
    render(
      <Pill name="File" onRemove={() => undefined} removeLabel="Remove file">
        a.pdf
      </Pill>,
    );
    expect(
      follows(screen.getByText("a.pdf"), screen.getByRole("button", { name: "Remove file" })),
    ).toBeTruthy();
  });

  it("needs a removeLabel with onRemove, and cannot be a plain pill's label-less x", () => {
    // @ts-expect-error onRemove without removeLabel
    const bad: ComponentProps<typeof Pill> = { onRemove: () => undefined, children: "x" };
    expect(bad).toBeDefined();
  });
});
