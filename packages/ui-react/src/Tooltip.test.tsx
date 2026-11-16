// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Button } from "./Button.js";
import { stubPopover, unstubPopover } from "./dom.harness.js";
import { IconButton } from "./IconButton.js";
import { Pill } from "./Pill.js";
import { render, screen, user } from "./render.harness.js";

// jsdom has no popover API and no anchor positioning: `stubPopover` adds the API, and its
// `CSS.supports` says yes, so the tooltip takes its enhanced path. Without the stub it keeps the
// native `title`, which is what a browser without anchor positioning gets.

/** The accessible description: the text of the elements `aria-describedby` names, in order. */
function description(element: Element): string {
  const ids = element.getAttribute("aria-describedby")?.split(/\s+/) ?? [];
  return ids
    .map((id) => document.getElementById(id)?.textContent ?? "")
    .filter(Boolean)
    .join(" ");
}

function blocked(props: { "aria-describedby"?: string; onClick?: () => void } = {}) {
  return (
    <Button disabledReason="Pick a shop first" {...props}>
      Save
    </Button>
  );
}

const save = () => screen.getByRole("button", { name: "Save" });

/** The tooltips on screen: a closed popover is not drawn (`display: none`), as in a browser. */
function shown(): Element[] {
  return screen
    .queryAllByRole("tooltip", { hidden: true })
    .filter((tip) => getComputedStyle(tip).display !== "none");
}

describe("tooltip, without anchor positioning", () => {
  it("keeps the native title on IconButton, a blocked Button and a titled Pill, and draws no tooltip", () => {
    render(
      <>
        <IconButton label="Settings" icon="settings" />
        {blocked()}
        <Pill title="Paid on 3 May">Paid</Pill>
      </>,
    );
    expect(screen.getByRole("button", { name: "Settings" }).getAttribute("title")).toBe("Settings");
    expect(save().getAttribute("title")).toBe("Pick a shop first");
    expect(screen.getByText("Paid").closest("[title]")?.getAttribute("title")).toBe(
      "Paid on 3 May",
    );
    expect(screen.queryAllByRole("tooltip", { hidden: true })).toEqual([]);
  });

  it("keeps the native title when the browser lacks anchor positioning", () => {
    stubPopover();
    const supports = vi.spyOn(CSS, "supports").mockReturnValue(false);
    render(<IconButton label="Settings" icon="settings" />);
    expect(screen.getByRole("button", { name: "Settings" }).getAttribute("title")).toBe("Settings");
    expect(screen.queryAllByRole("tooltip", { hidden: true })).toEqual([]);
    supports.mockRestore();
    unstubPopover();
  });
});

describe("tooltip, with anchor positioning", () => {
  beforeEach(stubPopover);
  afterEach(unstubPopover);

  it("drops the title and shows the reason on keyboard focus, as the description", async () => {
    render(blocked());
    expect(save().hasAttribute("title")).toBe(false);
    expect(screen.queryByRole("tooltip")).toBeNull();
    await user().tab();
    expect(document.activeElement).toBe(save());
    expect(screen.getByRole("tooltip").textContent).toBe("Pick a shop first");
    expect(description(save())).toBe("Pick a shop first");
  });

  it("closes on Escape and keeps the focus on the button", async () => {
    render(blocked());
    const u = user();
    await u.tab();
    await u.keyboard("{Escape}");
    expect(screen.queryByRole("tooltip")).toBeNull();
    expect(document.activeElement).toBe(save());
  });

  it("closes on blur", async () => {
    render(
      <>
        {blocked()}
        <button type="button">Next</button>
      </>,
    );
    const u = user();
    await u.tab();
    await u.tab();
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("shows the reason again on keyboard focus after a click on the focused button", async () => {
    render(
      <>
        {blocked()}
        <button type="button">Next</button>
      </>,
    );
    const u = user();
    await u.tab();
    await u.click(save());
    await u.tab();
    await u.tab({ shift: true });
    expect(document.activeElement).toBe(save());
    expect(screen.getByRole("tooltip").textContent).toBe("Pick a shop first");
  });

  it("shows an IconButton's label on hover and hides it on leave, as no description", async () => {
    render(<IconButton label="Settings" icon="settings" />);
    const button = screen.getByRole("button", { name: "Settings" });
    const u = user();
    await u.hover(button);
    // Its text is the name, so the tooltip is hidden from assistive tech and links nothing.
    expect(shown().map((tip) => tip.textContent)).toEqual(["Settings"]);
    expect(description(button)).toBe("");
    await u.unhover(button);
    expect(shown()).toEqual([]);
  });

  it("keeps a caller's aria-describedby and adds the tooltip to it", () => {
    render(
      <>
        <p id="own">Saved drafts are kept.</p>
        {blocked({ "aria-describedby": "own" })}
      </>,
    );
    expect(description(save())).toBe("Saved drafts are kept. Pick a shop first");
  });

  it("blocks a click, Enter and Space, submits no form, and stays focusable", async () => {
    const onClick = vi.fn<() => void>();
    const onSubmit = vi.fn<() => void>();
    render(
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <Button type="submit" disabledReason="Pick a shop first" onClick={onClick}>
          Save
        </Button>
      </form>,
    );
    const u = user();
    await u.tab();
    expect(document.activeElement).toBe(save());
    await u.keyboard("{Enter} ");
    await u.click(save());
    expect(onClick).not.toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(save().getAttribute("aria-disabled")).toBe("true");
  });

  it("leaves busy as the native disabled, with no tooltip", () => {
    render(
      <Button busy disabledReason="Pick a shop first">
        Save
      </Button>,
    );
    expect(save().hasAttribute("disabled")).toBe(true);
    expect(screen.queryAllByRole("tooltip", { hidden: true })).toEqual([]);
  });

  it("opens on a touch tap on a blocked Button, and the next tap elsewhere closes it", async () => {
    render(
      <>
        {blocked()}
        <p>Elsewhere</p>
      </>,
    );
    const u = user();
    await u.pointer({ keys: "[TouchA]", target: save() });
    expect(screen.getByRole("tooltip").textContent).toBe("Pick a shop first");
    await u.pointer({ keys: "[TouchA]", target: screen.getByText("Elsewhere") });
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("opens nothing on a touch tap on an IconButton: a tap is its action", async () => {
    render(<IconButton label="Settings" icon="settings" />);
    await user().pointer({
      keys: "[TouchA]",
      target: screen.getByRole("button", { name: "Settings" }),
    });
    expect(shown()).toEqual([]);
  });

  it("makes a titled plain Pill reachable by Tab and describes it, and leaves an untitled one out", async () => {
    render(
      <>
        <Pill>Draft</Pill>
        <Pill title="Paid on 3 May">Paid</Pill>
      </>,
    );
    await user().tab();
    const focused = document.activeElement;
    expect(focused?.textContent).toBe("Paid");
    expect(screen.getByRole("tooltip").textContent).toBe("Paid on 3 May");
    expect(focused ? description(focused) : "").toBe("Paid on 3 May");
  });
});
