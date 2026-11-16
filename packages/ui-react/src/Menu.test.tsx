// @vitest-environment jsdom
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { LinkProvider } from "./link.js";
import { ListRow } from "./ListRow.js";
import { Menu, type MenuAction } from "./Menu.js";
import { render, screen, user } from "./render.harness.js";

function actions(spies: { fav?: () => void; chat?: () => void; hide?: () => void } = {}) {
  return [
    { label: "Favourite", icon: "plus", onSelect: spies.fav ?? (() => undefined) },
    { label: "Copy link", onSelect: spies.chat ?? (() => undefined) },
    { label: "Hide chat", tone: "danger", onSelect: spies.hide ?? (() => undefined) },
  ] satisfies [MenuAction, ...MenuAction[]];
}

function Row() {
  const [hidden, setHidden] = useState(false);
  return (
    <ListRow
      revealOnHover
      actions={
        <Menu
          size="sm"
          label="Row actions"
          items={[{ label: "Hide", onSelect: () => setHidden(true) }]}
        />
      }
    >
      {hidden ? "Hidden" : "Shown"}
    </ListRow>
  );
}

describe("Menu", () => {
  it("is a closed button named by its label, with aria-haspopup", () => {
    render(<Menu label="More actions" items={actions()} />);
    const trigger = screen.getByRole("button", { name: "More actions" });
    expect(trigger.hasAttribute("aria-haspopup")).toBe(true);
    expect(trigger.getAttribute("aria-expanded")).not.toBe("true");
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it('shows the label as the text with trigger="button"', () => {
    render(<Menu trigger="button" label="Export" items={actions()} />);
    expect(screen.getByRole("button", { name: "Export" }).textContent).toBe("Export");
  });

  it("opens on a click, named by its label, with the first item focused", async () => {
    render(<Menu label="More actions" items={actions()} />);
    const trigger = screen.getByRole("button", { name: "More actions" });
    await user().click(trigger);
    expect(screen.getByRole("menu", { name: "More actions" })).toBeTruthy();
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "Favourite" }));
  });

  it.each(["{Enter}", " ", "{ArrowDown}"])(
    "opens on %s with the first item focused",
    async (key) => {
      render(<Menu label="More actions" items={actions()} />);
      const u = user();
      await u.tab();
      await u.keyboard(key);
      expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "Favourite" }));
    },
  );

  it("opens on ArrowUp with the last item focused", async () => {
    render(<Menu label="More actions" items={actions()} />);
    const u = user();
    await u.tab();
    await u.keyboard("{ArrowUp}");
    expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "Hide chat" }));
  });

  it("moves with the arrows, wrapping, and with Home and End", async () => {
    render(<Menu label="More actions" items={actions()} />);
    const u = user();
    await u.click(screen.getByRole("button", { name: "More actions" }));
    await u.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "Copy link" }));
    await u.keyboard("{ArrowDown}{ArrowDown}");
    expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "Favourite" }));
    await u.keyboard("{ArrowUp}");
    expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "Hide chat" }));
    await u.keyboard("{Home}");
    expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "Favourite" }));
    await u.keyboard("{End}");
    expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "Hide chat" }));
  });

  it("moves to the item a typed letter starts", async () => {
    render(<Menu label="More actions" items={actions()} />);
    const u = user();
    await u.click(screen.getByRole("button", { name: "More actions" }));
    await u.keyboard("h");
    expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "Hide chat" }));
  });

  // React Aria puts focus back on the trigger in the frame after the menu closes; a real browser
  // proves that (menu.spec.ts), so these assert the close and the call, not the focus.
  it("runs an action once on Enter and closes", async () => {
    const hide = vi.fn<() => void>();
    render(<Menu label="More actions" items={actions({ hide })} />);
    const u = user();
    const trigger = screen.getByRole("button", { name: "More actions" });
    await u.tab();
    await u.keyboard("{Enter}{End}{Enter}");
    expect(hide).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu")).toBeNull();
    expect(trigger.getAttribute("aria-expanded")).not.toBe("true");
  });

  it("runs an action once on a click and closes", async () => {
    const fav = vi.fn<() => void>();
    render(<Menu label="More actions" items={actions({ fav })} />);
    const u = user();
    await u.click(screen.getByRole("button", { name: "More actions" }));
    await u.click(screen.getByRole("menuitem", { name: "Favourite" }));
    expect(fav).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("closes on Escape, running nothing", async () => {
    const fav = vi.fn<() => void>();
    render(<Menu label="More actions" items={actions({ fav })} />);
    const u = user();
    const trigger = screen.getByRole("button", { name: "More actions" });
    await u.tab();
    await u.keyboard("{Enter}{Escape}");
    expect(screen.queryByRole("menu")).toBeNull();
    expect(trigger.getAttribute("aria-expanded")).not.toBe("true");
    expect(fav).not.toHaveBeenCalled();
  });

  it("closes on a press outside", async () => {
    render(
      <>
        <p>Outside</p>
        <Menu label="More actions" items={actions()} />
      </>,
    );
    const u = user();
    await u.click(screen.getByRole("button", { name: "More actions" }));
    await u.click(screen.getByText("Outside"));
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("skips a disabled item with the arrows and ignores a click on it", async () => {
    const chat = vi.fn<() => void>();
    const items = actions({ chat });
    items[1] = { ...items[1], disabled: true } as (typeof items)[1];
    render(<Menu label="More actions" items={items} />);
    const u = user();
    await u.click(screen.getByRole("button", { name: "More actions" }));
    await u.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "Hide chat" }));
    await u.click(screen.getByRole("menuitem", { name: "Copy link" }));
    expect(chat).not.toHaveBeenCalled();
  });

  it("draws a link item as a menuitem link, external in a new tab", async () => {
    render(
      <Menu
        label="More actions"
        defaultOpen
        items={[
          { label: "Open chat", href: "/chats/42" },
          { label: "Help", href: "https://example.com/help", external: true },
        ]}
      />,
    );
    const open = screen.getByRole("menuitem", { name: "Open chat" });
    expect(open.getAttribute("href")).toBe("/chats/42");
    const help = screen.getByRole("menuitem", { name: "Help" });
    expect(help.getAttribute("target")).toBe("_blank");
    expect(help.getAttribute("rel")).toBe("noreferrer");
  });

  it("draws an in-app link item through the app's link adapter, as a menuitem", () => {
    render(
      <LinkProvider
        link={({ href, ...p }) => <a data-router="yes" href={`#router${href}`} {...p} />}
      >
        <Menu
          label="More actions"
          defaultOpen
          items={[{ label: "Open chat", href: "/chats/42" }]}
        />
      </LinkProvider>,
    );
    const item = screen.getByRole("menuitem", { name: "Open chat" });
    expect(item.getAttribute("data-router")).toBe("yes");
    expect(item.getAttribute("href")).toBe("#router/chats/42");
  });

  it("refuses an item that is both an action and a link", () => {
    // @ts-expect-error an item is an action or a link, never both
    const both: MenuAction = { label: "x", onSelect: () => undefined, href: "/x" };
    expect(both.label).toBe("x");
  });

  it("keeps a revealOnHover row's actions reachable while its menu is open", async () => {
    render(<Row />);
    const u = user();
    const trigger = screen.getByRole("button", { name: "Row actions" });
    await u.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    await u.keyboard("{Enter}");
    expect(screen.getByText("Hidden")).toBeTruthy();
  });
});
