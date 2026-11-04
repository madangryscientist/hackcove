// @vitest-environment jsdom
import { act } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Button } from "./Button.js";
import { Card } from "./Card.js";
import { liftInteractive } from "./cx.js";
import { mount, unmount } from "./dom.harness.js";
import { ListRow } from "./ListRow.js";
import { Table, TableBody, TableCell, TableRow } from "./Table.js";
import { TextLink } from "./TextLink.js";

afterEach(unmount);

// A linked ListRow, TableRow and Card hold their own links and buttons. The row link is never an
// ancestor of them, so a click on one is not a click on the row; the row (or card) lifts them
// above the stretched link with `liftInteractive`, which a browser, not jsdom, lays out.

const clicks = {
  row: vi.fn<() => void>(),
  inner: vi.fn<() => void>(),
  button: vi.fn<() => void>(),
};

function click(element: Element): void {
  act(() => {
    element.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
  });
}

const keep = (spy: () => void) => (event: { preventDefault: () => void }) => {
  event.preventDefault();
  spy();
};

const inner = (
  <>
    <TextLink href="/inner" onClick={keep(clicks.inner)}>
      Inner link
    </TextLink>
    <Button size="sm" onClick={clicks.button}>
      Act
    </Button>
  </>
);

const forms = {
  ListRow: () =>
    mount(
      <ListRow href="/row" onClick={keep(clicks.row)}>
        <b>Row</b>
        {inner}
      </ListRow>,
    ),
  TableRow: () =>
    mount(
      <Table caption="Rows">
        <TableBody>
          <TableRow>
            <TableCell>
              <TextLink stretch href="/row" onClick={keep(clicks.row)}>
                Row
              </TextLink>
            </TableCell>
            <TableCell>{inner}</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    ),
  Card: () =>
    mount(
      <Card href="/row" title="Card" onClick={keep(clicks.row)}>
        {inner}
      </Card>,
    ),
};

const rowLink = (container: HTMLElement) => {
  const link = container.querySelector<HTMLElement>('a[href="/row"]');
  if (!link) throw new Error("no row link");
  return link;
};

describe.each(Object.entries(forms))("a linked %s", (_name, render) => {
  it("sends a click on an inner TextLink to that link and not to the row link", () => {
    vi.clearAllMocks();
    const container = render();
    const link = container.querySelector<HTMLElement>('a[href="/inner"]');
    if (!link) throw new Error("no inner link");
    click(link);
    expect(clicks.inner).toHaveBeenCalledTimes(1);
    expect(clicks.row).not.toHaveBeenCalled();
  });

  it("sends a click on an inner Button to the button and not to the row link", () => {
    vi.clearAllMocks();
    const container = render();
    const button = container.querySelector("button");
    if (!button) throw new Error("no inner button");
    click(button);
    expect(clicks.button).toHaveBeenCalledTimes(1);
    expect(clicks.row).not.toHaveBeenCalled();
  });

  it("still follows the row link when the click is on the row link", () => {
    vi.clearAllMocks();
    const container = render();
    click(rowLink(container));
    expect(clicks.row).toHaveBeenCalledTimes(1);
    expect(clicks.inner).not.toHaveBeenCalled();
    expect(clicks.button).not.toHaveBeenCalled();
  });

  it("keeps the row link out of the inner controls and lifts them above it", () => {
    const container = render();
    const link = rowLink(container);
    for (const control of container.querySelectorAll('a[href="/inner"], button')) {
      expect(link.contains(control)).toBe(false);
    }
    expect(link.classList.contains("link-stretch")).toBe(true);
    const lifted = [...container.querySelectorAll("*")].filter((element) =>
      element.getAttribute("class")?.includes(liftInteractive),
    );
    expect(lifted.length).toBeGreaterThan(0);
    for (const control of container.querySelectorAll('a[href="/inner"], button')) {
      expect(lifted.some((root) => root.contains(control))).toBe(true);
    }
  });
});

describe("a linked ListRow and Card", () => {
  it("name the link by the row's own text, since the link itself is empty", () => {
    for (const render of [forms.ListRow, forms.Card]) {
      const link = rowLink(render());
      const id = link.getAttribute("aria-labelledby");
      expect(id).toBeTruthy();
      expect(link.textContent).toBe("");
      expect(document.getElementById(id ?? "")?.textContent).toContain("Inner link");
      unmount();
    }
  });
});
