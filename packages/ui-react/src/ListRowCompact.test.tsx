// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { Card } from "./Card.js";
import { ListRow } from "./ListRow.js";
import { render, screen } from "./render.harness.js";

describe("ListRow compact bordered list", () => {
  it("is a Card flush around static size=sm rows: no click target, the text and values shown", () => {
    render(
      <Card flush>
        <ListRow size="sm" trailing="R 1 200">
          Groceries
        </ListRow>
        <ListRow size="sm" divided trailing="R 640">
          Household
        </ListRow>
      </Card>,
    );
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.getByText("Household")).not.toBeNull();
    expect(screen.getByText("R 640")).not.toBeNull();
  });
});
