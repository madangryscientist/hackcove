// @vitest-environment jsdom
import { act } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mount, stubDialog, unmount } from "./dom.harness.js";
import { rankSiteSearch, SiteSearch, type SiteSearchItem } from "./SiteSearch.js";

beforeEach(stubDialog);
afterEach(unmount);

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

function type(host: HTMLElement, value: string): void {
  const el = host.ownerDocument.querySelector("dialog input");
  if (!(el instanceof HTMLInputElement)) throw new Error("no field");
  act(() => {
    Reflect.set(HTMLInputElement.prototype, "value", value, el);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

const press = (init: KeyboardEventInit) =>
  act(() => {
    window.dispatchEvent(
      new KeyboardEvent("keydown", { bubbles: true, cancelable: true, ...init }),
    );
  });

describe("SiteSearch", () => {
  it("renders the two triggers, named by the label, and Ctrl K on the server", () => {
    const html = renderToString(<SiteSearch items={ITEMS} label="Search components" />);
    expect(html.match(/aria-label="Search components"/g)).toHaveLength(2);
    expect(html).toContain("<kbd");
    expect(html).toContain("Ctrl K");
    expect(html).not.toContain("<dialog");
  });

  it("opens on Ctrl+K and on Cmd+K, and the browser's own shortcut is prevented", () => {
    const host = mount(<SiteSearch items={ITEMS} label="Search components" />);
    expect(host.querySelector("dialog")).toBeNull();
    const event = new KeyboardEvent("keydown", { key: "k", ctrlKey: true, cancelable: true });
    act(() => {
      window.dispatchEvent(event);
    });
    expect(event.defaultPrevented).toBe(true);
    expect(host.querySelector("dialog")?.getAttribute("aria-labelledby")).toBeTruthy();
    unmount();
    const again = mount(<SiteSearch items={ITEMS} label="Search components" />);
    press({ key: "k", metaKey: true });
    expect(again.querySelector("dialog")).not.toBeNull();
  });

  it("does not open on K with Shift or Alt, or on a plain K", () => {
    const host = mount(<SiteSearch items={ITEMS} label="Search components" />);
    press({ key: "k" });
    press({ key: "K", ctrlKey: true, shiftKey: true });
    press({ key: "k", ctrlKey: true, altKey: true });
    expect(host.querySelector("dialog")).toBeNull();
  });

  it("shows the prompt while empty, the ranked links as typed, and the no-match line", () => {
    const host = mount(<SiteSearch items={ITEMS} label="Search components" />);
    press({ key: "k", ctrlKey: true });
    const dialog = host.querySelector("dialog");
    if (!dialog) throw new Error("no dialog");
    expect(dialog.textContent).toContain("Type a name");
    expect(dialog.querySelector('[role="status"]')?.textContent).toBe("");

    type(host, "dia");
    const hrefs = [...dialog.querySelectorAll("a")].map((a) => a.getAttribute("href"));
    expect(hrefs).toEqual(["/dialog/", "/diagram/", "/field-dialog/", "/tabs/", "/drawer/"]);
    expect(dialog.textContent).not.toContain("Type a name");
    expect(dialog.querySelector('[role="status"]')?.textContent).toBe("5 results");

    type(host, "modal");
    expect(dialog.querySelector('[role="status"]')?.textContent).toBe("1 result");

    type(host, "zzz");
    expect(dialog.querySelectorAll("a")).toHaveLength(0);
    expect(dialog.textContent).toContain("No results for zzz");
    expect(dialog.querySelector('[role="status"]')?.textContent).toBe("No results");
  });
});
