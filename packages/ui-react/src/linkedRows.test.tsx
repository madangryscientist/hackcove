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

/** The button or link in `container` whose accessible name is `name`. */
const named = (container: HTMLElement, role: "button" | "link", name: string) => {
  const found = [...container.querySelectorAll<HTMLElement>(role === "link" ? "a" : "button")].find(
    (el) => {
      const by = el.getAttribute("aria-labelledby");
      const text = by ? document.getElementById(by)?.textContent : el.textContent;
      return (el.getAttribute("aria-label") ?? text)?.trim() === name;
    },
  );
  if (!found) throw new Error(`no ${role} named ${name}`);
  return found;
};

// A button ListRow is the same shape: a div with its button stretched over it, so `trailing` can
// hold a link drawn by the app's router and a tap on that link is not a tap on the row.
describe("a button ListRow with a trailing link", () => {
  const select = vi.fn<() => void>();
  const view = vi.fn<() => void>();
  const renderRow = () =>
    mount(
      <ListRow
        onClick={select}
        trailing={
          <Button
            size="sm"
            variant="outline"
            render={(p) => <a data-router="1" href="/shops/grace" {...p} />}
            onClick={keep(view)}
          >
            View
          </Button>
        }
      >
        Grace
      </ListRow>,
    );
  it("runs onClick from the row's button, which is named by the label alone", () => {
    vi.clearAllMocks();
    const container = renderRow();
    click(named(container, "button", "Grace"));
    expect(select).toHaveBeenCalledTimes(1);
    expect(view).not.toHaveBeenCalled();
  });

  it("follows the trailing link and does not run the row's onClick", () => {
    vi.clearAllMocks();
    const container = renderRow();
    click(named(container, "link", "View"));
    expect(view).toHaveBeenCalledTimes(1);
    expect(select).not.toHaveBeenCalled();
  });

  it("nests no link in the button, and puts the button before the link in tab order", () => {
    const container = renderRow();
    const button = named(container, "button", "Grace");
    const link = named(container, "link", "View");
    expect(container.querySelector("button a, a button")).toBeNull();
    expect(button.compareDocumentPosition(link) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("a disabled row's button is disabled, so a tap on the row does nothing", () => {
    vi.clearAllMocks();
    const container = mount(
      <ListRow disabled onClick={select}>
        Grace
      </ListRow>,
    );
    const button = named(container, "button", "Grace");
    expect(button).toHaveProperty("disabled", true);
    click(button);
    expect(select).not.toHaveBeenCalled();
  });
});
