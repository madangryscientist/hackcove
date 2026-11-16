// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { Button } from "./Button.js";
import { render, screen, user } from "./render.harness.js";

const save = () => screen.getByRole("button", { name: "Save" });

describe("Button", () => {
  it("is type=button by default, and a click runs onClick", async () => {
    const onClick = vi.fn<() => void>();
    render(<Button onClick={onClick}>Save</Button>);
    expect(save().getAttribute("type")).toBe("button");
    await user().click(save());
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("passes type and disabled through", () => {
    render(
      <Button type="submit" disabled>
        Go
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Go" });
    expect(button.getAttribute("type")).toBe("submit");
    expect(button.hasAttribute("disabled")).toBe(true);
  });
});

describe("Button states", () => {
  it("blocked: disabled, titled with the reason, and a click does nothing", async () => {
    const onClick = vi.fn<() => void>();
    render(
      <Button variant="outline" disabledReason="Pick a shop first" onClick={onClick}>
        Save
      </Button>,
    );
    expect(save().hasAttribute("disabled")).toBe(true);
    expect(save().getAttribute("title")).toBe("Pick a shop first");
    await user().click(save());
    expect(onClick).not.toHaveBeenCalled();
  });

  it("blocked: the reason beats a title", () => {
    render(
      <Button disabledReason="No" title="Save">
        Save
      </Button>,
    );
    expect(save().getAttribute("title")).toBe("No");
  });

  it("busy: disabled and aria-busy", () => {
    render(<Button busy>Save</Button>);
    expect(save().hasAttribute("disabled")).toBe(true);
    expect(save().getAttribute("aria-busy")).toBe("true");
  });

  it("busy: a string is the label while busy; busy alone keeps the label", () => {
    render(
      <>
        <Button busy="Saving…">Save</Button>
        <Button busy>Busy</Button>
        <Button>Idle</Button>
      </>,
    );
    expect(screen.getByRole("button", { name: "Saving…" })).not.toBeNull();
    expect(screen.getByRole("button", { name: "Busy" })).not.toBeNull();
    expect(screen.getByRole("button", { name: "Idle" })).not.toBeNull();
    expect(screen.queryByRole("button", { name: "Save" })).toBeNull();
  });

  it("busy wins over disabledReason: aria-busy, and no reason as the title", () => {
    render(
      <Button busy="Saving…" disabledReason="No">
        Save
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Saving…" });
    expect(button.getAttribute("aria-busy")).toBe("true");
    expect(button.hasAttribute("title")).toBe(false);
  });

  it("neither state: not disabled, no aria-busy", () => {
    render(<Button>Save</Button>);
    expect(save().hasAttribute("disabled")).toBe(false);
    expect(save().hasAttribute("aria-busy")).toBe(false);
  });
});
