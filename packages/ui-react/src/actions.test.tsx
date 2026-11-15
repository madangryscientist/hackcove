// @vitest-environment jsdom
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Button } from "./Button.js";
import { CopyButton } from "./CopyButton.js";
import { IconButton } from "./IconButton.js";
import { Pill } from "./Pill.js";
import { render, screen } from "./render.harness.js";

describe("Button", () => {
  it('busy="Saving" is busy and named Saving', () => {
    render(<Button busy="Saving">Save</Button>);
    const button = screen.getByRole("button", { name: "Saving" });
    expect(button.getAttribute("aria-busy")).toBe("true");
    expect(button.hasAttribute("disabled")).toBe(true);
  });

  it("busy={false} with a label is the idle button", () => {
    render(<Button busy={false}>Save</Button>);
    expect(screen.getByRole("button", { name: "Save" }).hasAttribute("aria-busy")).toBe(false);
  });

  it("an icon is decorative: the name is the label alone", () => {
    render(
      <>
        <Button icon="plus">Add a line</Button>
        <Button icon="external-link" href="/docs">
          Docs
        </Button>
      </>,
    );
    expect(screen.getByRole("button", { name: "Add a line" })).not.toBeNull();
    expect(screen.getByRole("link", { name: "Docs" })).not.toBeNull();
  });

  it("ref reaches the button and the link", () => {
    const button = createRef<HTMLButtonElement>();
    const link = createRef<HTMLAnchorElement>();
    render(
      <>
        <Button ref={button}>Save</Button>
        <Button ref={link} href="/docs">
          Docs
        </Button>
      </>,
    );
    expect(button.current).toBe(screen.getByRole("button", { name: "Save" }));
    expect(link.current).toBe(screen.getByRole("link", { name: "Docs" }));
  });
});

describe("IconButton", () => {
  it("is named by its label, and count joins the name", () => {
    render(
      <>
        <IconButton label="Settings" icon="settings" />
        <IconButton label="Alerts" icon="bell" count={3} />
        <IconButton label="Inbox" icon="bell" count={0} />
      </>,
    );
    expect(screen.getByRole("button", { name: "Settings" })).not.toBeNull();
    expect(screen.getByRole("button", { name: "Alerts, 3" })).not.toBeNull();
    expect(screen.getByRole("button", { name: "Inbox" })).not.toBeNull();
  });
});

describe("Pill", () => {
  it("name makes a two-tone pill that reads name: value", () => {
    render(<Pill name="Weight">72 kg</Pill>);
    expect(screen.getByText("Weight").textContent).toBe("Weight:");
    expect(screen.getByText("72 kg")).not.toBeNull();
  });
});

describe("CopyButton", () => {
  it("is named Copy by default", () => {
    render(<CopyButton text="x" />);
    expect(screen.getByRole("button", { name: "Copy" })).not.toBeNull();
  });
});
