// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { CopyButton } from "./CopyButton.js";
import { act, render, screen, user } from "./render.harness.js";

afterEach(() => {
  vi.restoreAllMocks();
});

/** Lets the clipboard write's promise settle. */
const settle = () => act(async () => {});

describe("CopyButton", () => {
  it("is named by its label and announces nothing before a click", () => {
    render(<CopyButton text="bun add" />);
    expect(screen.getByRole("button", { name: "copy" })).not.toBeNull();
    expect(screen.getByRole("status").textContent).toBe("");
    expect(screen.getByText("copied").getAttribute("aria-hidden")).toBe("true");
  });

  it("copies its text on a click, announces copied, and keeps its name", async () => {
    const u = user();
    render(<CopyButton text="bun add" />);
    await u.click(screen.getByRole("button", { name: "copy" }));
    await settle();
    expect(await navigator.clipboard.readText()).toBe("bun add");
    expect(screen.getByRole("status").textContent).toBe("copied");
    expect(screen.getByRole("button", { name: "copy" })).not.toBeNull();
  });

  it("announces nothing when the clipboard refuses the write", async () => {
    const u = user();
    const writeText = vi.fn<(text: string) => Promise<void>>(() => Promise.reject(new Error("no")));
    vi.spyOn(navigator.clipboard, "writeText").mockImplementation(writeText);
    render(<CopyButton text="bun add" />);
    await u.click(screen.getByRole("button", { name: "copy" }));
    await settle();
    expect(writeText).toHaveBeenCalledExactlyOnceWith("bun add");
    expect(screen.getByRole("status").textContent).toBe("");
  });

  it("takes label and copiedLabel overrides", async () => {
    const u = user();
    render(<CopyButton text="x" label="Copy token" copiedLabel="Done" />);
    await u.click(screen.getByRole("button", { name: "Copy token" }));
    await settle();
    expect(screen.getByRole("status").textContent).toBe("Done");
  });

  it("is type=button, so it does not submit the form it sits in", async () => {
    const u = user();
    const onSubmit = vi.fn<() => void>();
    render(
      <form onSubmit={onSubmit}>
        <CopyButton text="x" />
      </form>,
    );
    const button = screen.getByRole("button", { name: "copy" });
    expect(button.getAttribute("type")).toBe("button");
    await u.click(button);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("passes disabled through to the button, which then copies nothing", async () => {
    const u = user();
    const writeText = vi.spyOn(navigator.clipboard, "writeText");
    render(<CopyButton text="x" disabled />);
    const button = screen.getByRole("button", { name: "copy" });
    expect(button.hasAttribute("disabled")).toBe(true);
    await u.click(button);
    expect(writeText).not.toHaveBeenCalled();
  });
});
