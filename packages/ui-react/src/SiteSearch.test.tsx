// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { stubDialog } from "./dom.harness.js";
import { render, screen, user, within } from "./render.harness.js";
import { rankSiteSearch, SiteSearch, type SiteSearchItem } from "./SiteSearch.js";

beforeEach(stubDialog);

const ITEMS: SiteSearchItem[] = [
  { label: "Drawer", description: "A panel from the side, not a dialog.", href: "/drawer/" },
  { label: "FieldDialog", description: "One field in a dialog.", href: "/field-dialog/" },
  { label: "Dialog", description: "A modal window.", href: "/dialog/" },
  { label: "Tabs", description: "Switch a view.", href: "/tabs/", keywords: ["TabsDialogish"] },
  { label: "Diagram", description: "A drawing.", href: "/diagram/" },
];

const labels = (items: SiteSearchItem[]) => items.map((item) => item.label);

describe("rankSiteSearch", () => {
  it("ranks label starts, then label contains, then keyword, then description; ties keep order", () => {
    expect(labels(rankSiteSearch(ITEMS, "dia"))).toEqual([
      "Dialog",
      "Diagram",
      "FieldDialog",
      "Tabs",
      "Drawer",
    ]);
  });

  it("ignores case and the spaces around the text", () => {
    expect(labels(rankSiteSearch(ITEMS, "  TABS "))).toEqual(["Tabs"]);
  });

  it("matches nothing for empty text, and nothing for text no item has", () => {
    expect(rankSiteSearch(ITEMS, "")).toEqual([]);
    expect(rankSiteSearch(ITEMS, "   ")).toEqual([]);
    expect(rankSiteSearch(ITEMS, "zzz")).toEqual([]);
  });
});

/** The first of the two triggers (the wide one; the other is the phone's icon button). */
function firstTrigger(): HTMLElement {
  const [first] = screen.getAllByRole("button", { name: "Search components" });
  if (!first) throw new Error("no trigger");
  return first;
}

const search = () => render(<SiteSearch items={ITEMS} label="Search components" />);

/** Whether the last keydown to reach the window had its default prevented. */
function lastKeyPrevented(): () => boolean | undefined {
  let prevented: boolean | undefined;
  window.addEventListener("keydown", (event) => {
    prevented = event.defaultPrevented;
  });
  return () => prevented;
}

describe("SiteSearch", () => {
  it("renders two triggers named by the label, showing Ctrl K, and no dialog until asked", () => {
    search();
    const triggers = screen.getAllByRole("button", { name: "Search components" });
    expect(triggers).toHaveLength(2);
    expect(triggers.map((t) => t.getAttribute("aria-haspopup"))).toEqual(["dialog", "dialog"]);
    expect(screen.getByText("Ctrl K")).not.toBeNull();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("opens on Ctrl+K, named by the label, and the browser's own shortcut is prevented", async () => {
    search();
    const prevented = lastKeyPrevented();
    await user().keyboard("{Control>}k{/Control}");
    expect(screen.getByRole("dialog", { name: "Search components" })).not.toBeNull();
    expect(prevented()).toBe(true);
  });

  it("opens on Cmd+K", async () => {
    search();
    await user().keyboard("{Meta>}k{/Meta}");
    expect(screen.getByRole("dialog", { name: "Search components" })).not.toBeNull();
  });

  it("opens from a click on a trigger", async () => {
    search();
    await user().click(firstTrigger());
    expect(screen.getByRole("dialog", { name: "Search components" })).not.toBeNull();
  });

  it("does not open on K with Shift or Alt, or on a plain K", async () => {
    search();
    const person = user();
    await person.keyboard("k");
    await person.keyboard("{Control>}{Shift>}K{/Shift}{/Control}");
    await person.keyboard("{Control>}{Alt>}k{/Alt}{/Control}");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("shows the prompt while empty, the ranked links as typed, and the no-match line", async () => {
    search();
    const person = user();
    await person.keyboard("{Control>}k{/Control}");
    const dialog = within(screen.getByRole("dialog", { name: "Search components" }));
    expect(dialog.getByText("Type a name")).not.toBeNull();
    expect(dialog.getByRole("status").textContent).toBe("");

    const field = dialog.getByRole("searchbox", { name: "Search components" });
    await person.type(field, "dia");
    const hrefs = dialog.getAllByRole("link").map((a) => a.getAttribute("href"));
    expect(hrefs).toEqual(["/dialog/", "/diagram/", "/field-dialog/", "/tabs/", "/drawer/"]);
    expect(dialog.queryByText("Type a name")).toBeNull();
    expect(dialog.getByRole("status").textContent).toBe("5 results");

    await person.clear(field);
    await person.type(field, "modal");
    expect(dialog.getByRole("status").textContent).toBe("1 result");

    await person.clear(field);
    await person.type(field, "zzz");
    expect(dialog.queryAllByRole("link")).toHaveLength(0);
    expect(dialog.getByText("No results for zzz")).not.toBeNull();
    expect(dialog.getByRole("status").textContent).toBe("No results");
  });
});
