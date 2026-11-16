// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { BulletItem, BulletList } from "./BulletList.js";
import { Callout } from "./Callout.js";
import { render, screen, within } from "./render.harness.js";
import { Caption, Text } from "./typography.js";

describe("Text and Caption are paragraphs", () => {
  it("Text is a paragraph by default", () => {
    render(<Text>Two things shipped.</Text>);
    expect(screen.getByRole("paragraph").textContent).toBe("Two things shipped.");
  });

  it("Caption is a paragraph by default", () => {
    render(<Caption>Updated today.</Caption>);
    expect(screen.getByRole("paragraph").textContent).toBe("Updated today.");
  });

  it('as="span" is the inline form, inside a paragraph of its own', () => {
    render(
      <Text>
        Saved <Text as="span">two</Text> files, <Caption as="span">just now</Caption>.
      </Text>,
    );
    expect(screen.getAllByRole("paragraph")).toHaveLength(1);
    expect(screen.getByRole("paragraph").textContent).toBe("Saved two files, just now.");
  });
});

describe("BulletItem", () => {
  it("is an item of the BulletList's list", () => {
    render(
      <BulletList>
        <BulletItem>Moved the build to a queue.</BulletItem>
        <BulletItem>Wrote the runbook.</BulletItem>
      </BulletList>,
    );
    const items = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(items.map((item) => item.textContent)).toEqual([
      "Moved the build to a queue.",
      "Wrote the runbook.",
    ]);
  });
});

describe("Callout icon", () => {
  it("is decorative: the notice reads as its text alone", () => {
    render(
      <Callout icon="check" tone="positive" data-testid="notice">
        Saved.
      </Callout>,
    );
    expect(screen.getByTestId("notice").textContent).toBe("Saved.");
    expect(screen.queryByRole("img")).toBeNull();
  });
});
