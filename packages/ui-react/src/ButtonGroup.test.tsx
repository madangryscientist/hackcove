// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { ButtonGroup } from "./ButtonGroup.js";
import { render, screen, within } from "./render.harness.js";

describe("ButtonGroup", () => {
  it("is no group without a label", () => {
    render(
      <ButtonGroup>
        <button type="button">Save</button>
      </ButtonGroup>,
    );
    expect(screen.queryByRole("group")).toBeNull();
  });

  it("reads the end item after the row's buttons", () => {
    render(
      <ButtonGroup end={<a href="/">Back</a>}>
        <button type="button">Save</button>
      </ButtonGroup>,
    );
    const save = screen.getByRole("button", { name: "Save" });
    const back = screen.getByRole("link", { name: "Back" });
    expect(save.compareDocumentPosition(back) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("label makes it a group named by the label, holding its buttons", () => {
    render(
      <ButtonGroup label="Quote actions">
        <button type="button">Save</button>
      </ButtonGroup>,
    );
    const group = screen.getByRole("group", { name: "Quote actions" });
    expect(within(group).getByRole("button", { name: "Save" })).not.toBeNull();
  });
});
