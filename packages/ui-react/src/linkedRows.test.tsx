// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { Button } from "./Button.js";
import { Card } from "./Card.js";
import { ListRow } from "./ListRow.js";
import { render, screen, user } from "./render.harness.js";
import { Table, TableBody, TableCell, TableRow } from "./Table.js";
import { TextLink } from "./TextLink.js";

// A linked ListRow, TableRow and Card hold their own links and buttons. The row link is never an
// ancestor of them, so a click on one is not a click on the row; the row (or card) lifts them
// above the stretched link with `liftInteractive`, which a browser, not jsdom, lays out
// (`card-under-sticky-bars.spec.ts` and `list-row-button.spec.ts` click them there).

const clicks = {
  row: vi.fn<() => void>(),
  inner: vi.fn<() => void>(),
  button: vi.fn<() => void>(),
};

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
    render(
      <ListRow href="/row" onClick={keep(clicks.row)}>
        <b>Row</b>
        {inner}
      </ListRow>,
    ),
  TableRow: () =>
    render(
      <Table label="Rows">
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
    render(
      <Card href="/row" title="Card" onClick={keep(clicks.row)}>
        {inner}
      </Card>,
    ),
};

/** The row's own link: the one link that goes to `/row`. */
const rowLink = (): HTMLElement => {
  const links = screen.getAllByRole("link").filter((link) => link.getAttribute("href") === "/row");
  const [link] = links;
  if (links.length !== 1 || !link) throw new Error(`${links.length} row links`);
  return link;
};

describe.each(Object.entries(forms))("a linked %s", (_name, draw) => {
  it("sends a click on an inner TextLink to that link and not to the row link", async () => {
    vi.clearAllMocks();
    draw();
    await user().click(screen.getByRole("link", { name: "Inner link" }));
    expect(clicks.inner).toHaveBeenCalledTimes(1);
    expect(clicks.row).not.toHaveBeenCalled();
  });

  it("sends a click on an inner Button to the button and not to the row link", async () => {
    vi.clearAllMocks();
    draw();
    await user().click(screen.getByRole("button", { name: "Act" }));
    expect(clicks.button).toHaveBeenCalledTimes(1);
    expect(clicks.row).not.toHaveBeenCalled();
  });

  it("still follows the row link when the click is on the row link", async () => {
    vi.clearAllMocks();
    draw();
    await user().click(rowLink());
    expect(clicks.row).toHaveBeenCalledTimes(1);
    expect(clicks.inner).not.toHaveBeenCalled();
    expect(clicks.button).not.toHaveBeenCalled();
  });

  it("keeps the inner controls out of the row link", () => {
    draw();
    const link = rowLink();
    expect(link.contains(screen.getByRole("link", { name: "Inner link" }))).toBe(false);
    expect(link.contains(screen.getByRole("button", { name: "Act" }))).toBe(false);
  });
});

describe("a linked ListRow and Card", () => {
  it.each([
    ["ListRow", forms.ListRow, /^Row\s*Inner link/],
    ["Card", forms.Card, /^Card\s*Inner link/],
  ])(
    "a %s names the link by the row's own text, since the link itself is empty",
    (_name, draw, name) => {
      draw();
      const link = rowLink();
      expect(link.textContent).toBe("");
      expect(screen.getByRole("link", { name })).toBe(link);
    },
  );
});

// A button ListRow is the same shape as a linked one (its click and tap order are proven in a
// browser, `list-row-button.spec.ts`); a disabled one disables its button, so the row does not fire.
describe("a disabled button ListRow", () => {
  it("disables the row's button, so a tap on the row does nothing", async () => {
    const select = vi.fn<() => void>();
    render(
      <ListRow disabled onClick={select}>
        Grace
      </ListRow>,
    );
    const button = screen.getByRole<HTMLButtonElement>("button", { name: "Grace" });
    expect(button.disabled).toBe(true);
    await user().click(button);
    expect(select).not.toHaveBeenCalled();
  });
});
