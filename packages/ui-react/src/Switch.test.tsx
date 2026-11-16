// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { render, screen, user } from "./render.harness.js";
import { Switch } from "./Switch.js";

const noop = () => undefined;

/** The one switch on the page, as the button it is. */
function theSwitch(): HTMLButtonElement {
  const found = screen.getByRole("switch");
  if (!(found instanceof HTMLButtonElement)) throw new Error("the switch is not a button");
  return found;
}

describe("Switch", () => {
  it("is a button of type button named by its label, off when checked is false", () => {
    render(<Switch label="Live" checked={false} onChange={noop} />);
    const off = screen.getByRole("switch", { name: "Live" });
    expect(off.tagName).toBe("BUTTON");
    expect(off.getAttribute("type")).toBe("button");
    expect(off.getAttribute("aria-checked")).toBe("false");
  });

  it("is on when checked is true", () => {
    render(<Switch label="Live" checked onChange={noop} />);
    expect(screen.getByRole("switch", { name: "Live" }).getAttribute("aria-checked")).toBe("true");
  });

  it("calls onChange with true when off, and does not flip by itself", async () => {
    const onChange = vi.fn<(checked: boolean) => void>();
    render(<Switch label="Live" checked={false} onChange={onChange} />);
    await user().click(theSwitch());
    expect(onChange).toHaveBeenCalledExactlyOnceWith(true);
    expect(theSwitch().getAttribute("aria-checked")).toBe("false");
  });

  it("calls onChange with false when on", async () => {
    const onChange = vi.fn<(checked: boolean) => void>();
    render(<Switch label="Live" checked onChange={onChange} />);
    await user().click(theSwitch());
    expect(onChange).toHaveBeenCalledExactlyOnceWith(false);
  });

  it("flips once on Space and once on Enter", async () => {
    const onChange = vi.fn<(checked: boolean) => void>();
    render(<Switch label="Live" checked={false} onChange={onChange} />);
    const person = user();
    await person.tab();
    expect(document.activeElement).toBe(theSwitch());
    await person.keyboard(" ");
    await person.keyboard("{Enter}");
    expect(onChange.mock.calls).toEqual([[true], [true]]);
  });

  it("clicking the label flips it once", async () => {
    const onChange = vi.fn<(checked: boolean) => void>();
    render(<Switch label="Live" checked={false} onChange={onChange} />);
    await user().click(screen.getByText("Live"));
    expect(onChange).toHaveBeenCalledExactlyOnceWith(true);
  });

  it("busy ignores a click, keeps aria-busy and stays focusable", async () => {
    const onChange = vi.fn<(checked: boolean) => void>();
    render(<Switch label="Live" checked busy onChange={onChange} />);
    const busy = theSwitch();
    const person = user();
    await person.tab();
    expect(document.activeElement).toBe(busy);
    await person.click(busy);
    expect(onChange).not.toHaveBeenCalled();
    expect(busy.getAttribute("aria-busy")).toBe("true");
    expect(busy.getAttribute("aria-disabled")).toBe("true");
    expect(busy.disabled).toBe(false);
  });

  it("is not busy by default: no aria-busy, no aria-disabled", () => {
    render(<Switch label="Live" checked onChange={noop} />);
    expect(theSwitch().hasAttribute("aria-busy")).toBe(false);
    expect(theSwitch().hasAttribute("aria-disabled")).toBe(false);
  });

  it("disabled is the native attribute and ignores a click", async () => {
    const onChange = vi.fn<(checked: boolean) => void>();
    render(<Switch label="Live" checked disabled onChange={onChange} />);
    expect(theSwitch().disabled).toBe(true);
    await user().click(screen.getByText("Live"));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("a hint is the switch's description, and reads after the label", () => {
    render(<Switch label="Live" hint="Serves all traffic" checked onChange={noop} />);
    expect(
      screen.getByRole("switch", { name: /^Live/, description: "Serves all traffic" }),
    ).not.toBeNull();
    const label = screen.getByText("Live");
    const description = screen.getByText("Serves all traffic");
    expect(label.compareDocumentPosition(description) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });

  it("a hint keeps a caller's aria-describedby", () => {
    render(
      <>
        <span id="other">Also this</span>
        <Switch label="L" hint="D" aria-describedby="other" checked onChange={noop} />
      </>,
    );
    expect(screen.getByRole("switch", { description: "Also this D" })).not.toBeNull();
  });

  it("without a hint the switch has none", () => {
    render(<Switch label="L" checked onChange={noop} />);
    expect(theSwitch().hasAttribute("aria-describedby")).toBe(false);
  });

  it("a bare switch is named by aria-label, with no label around it", async () => {
    const onChange = vi.fn<(checked: boolean) => void>();
    render(<Switch aria-label="Live in staging" checked onChange={onChange} />);
    expect(screen.getByRole("switch", { name: "Live in staging" })).toBe(theSwitch());
    expect(theSwitch().labels).toHaveLength(0);
    await user().click(theSwitch());
    expect(onChange).toHaveBeenCalledExactlyOnceWith(false);
  });

  it("passes other button props through and calls the caller's onClick first", async () => {
    const calls: string[] = [];
    render(
      <Switch
        label="Live"
        checked={false}
        onChange={() => calls.push("change")}
        onClick={() => calls.push("click")}
        name="live"
        id="live-switch"
      />,
    );
    const button = theSwitch();
    expect(button.id).toBe("live-switch");
    expect(button.name).toBe("live");
    await user().click(button);
    expect(calls).toEqual(["click", "change"]);
  });

  it("a caller's onClick can stop the change with preventDefault", async () => {
    const onChange = vi.fn<(checked: boolean) => void>();
    render(
      <Switch
        label="Live"
        checked={false}
        onChange={onChange}
        onClick={(event) => event.preventDefault()}
      />,
    );
    await user().click(theSwitch());
    expect(onChange).not.toHaveBeenCalled();
  });
});
