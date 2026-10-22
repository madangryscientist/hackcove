import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Button, buttonClass } from "./Button.js";

describe("Button", () => {
  it("renders type=button in the primary style by default", () => {
    const out = renderToStaticMarkup(<Button>Save</Button>);
    expect(out).toContain('type="button"');
    expect(out).toContain("bg-violet-600");
  });

  it("renders the outline variant without the filled background", () => {
    const out = renderToStaticMarkup(<Button variant="outline">Cancel</Button>);
    expect(out).toContain("border-violet-600");
    expect(out).not.toContain("bg-violet-600");
  });

  it("passes type, disabled and className through", () => {
    const out = renderToStaticMarkup(
      <Button type="submit" disabled className="w-full">
        Go
      </Button>,
    );
    expect(out).toContain('type="submit"');
    expect(out).toContain("disabled");
    expect(out).toContain("w-full");
  });
});

describe("buttonClass", () => {
  it("gives a link the ghost classes", () => {
    expect(buttonClass("ghost")).toContain("text-slate-600");
  });
});

const html = renderToStaticMarkup;

describe("Button states", () => {
  it("blocked: disabled, titled with the reason, flat grey, keeps pointer events", () => {
    const out = html(<Button disabledReason="Pick a shop first">Save</Button>);
    expect(out).toContain("disabled");
    expect(out).toContain('title="Pick a shop first"');
    expect(out).toContain("cursor-not-allowed");
    expect(out).toContain("bg-slate-100");
    expect(out).not.toContain("bg-violet-600");
    expect(out).not.toContain("pointer-events-none");
    expect(out).not.toContain("opacity-50");
  });

  it("blocked: the reason beats a title", () => {
    const out = html(
      <Button disabledReason="No" title="Save">
        Save
      </Button>,
    );
    expect(out).toContain('title="No"');
  });

  it("busy: disabled, aria-busy, keeps its variant colour", () => {
    const out = html(<Button busy>Save</Button>);
    expect(out).toContain("disabled");
    expect(out).toContain('aria-busy="true"');
    expect(out).toContain("cursor-progress");
    expect(out).toContain("bg-violet-600");
    expect(out).not.toContain("pointer-events-none");
  });

  it("busy: busyLabel replaces the label; without one the label stays", () => {
    expect(
      html(
        <Button busy busyLabel="Saving…">
          Save
        </Button>,
      ),
    ).toContain(">Saving…<");
    expect(html(<Button busy>Save</Button>)).toContain(">Save<");
    expect(html(<Button busyLabel="Saving…">Save</Button>)).toContain(">Save<");
  });

  it("busy wins over disabledReason", () => {
    const out = html(
      <Button busy busyLabel="Saving…" disabledReason="No">
        Save
      </Button>,
    );
    expect(out).toContain('aria-busy="true"');
    expect(out).toContain("cursor-progress");
    expect(out).toContain("bg-violet-600");
    expect(out).not.toContain("cursor-not-allowed");
    expect(out).not.toContain('title="No"');
  });

  it("neither state: not disabled, no aria-busy", () => {
    const out = html(<Button>Save</Button>);
    expect(out).not.toContain("disabled=");
    expect(out).not.toContain("aria-busy");
  });

  it("a plain disabled keeps the half-opacity look", () => {
    const out = html(<Button disabled>Save</Button>);
    expect(out).toContain("disabled:opacity-50");
    expect(out).toContain("disabled:pointer-events-none");
    expect(out).not.toContain("cursor-not-allowed");
  });

  it("blocked works on every variant", () => {
    for (const variant of ["primary", "outline", "ghost"] as const) {
      const out = html(
        <Button variant={variant} disabledReason="No">
          X
        </Button>,
      );
      expect(out).toContain("border-slate-200");
      expect(out).not.toMatch(/(?:bg|border|text)-violet/);
      expect(out).not.toContain("hover:");
    }
  });

  it("no state class uses an important override", () => {
    const out = html(<Button disabledReason="No">X</Button>) + html(<Button busy>X</Button>);
    expect(out).not.toMatch(/class="[^"]*![^"]*"/);
  });
});
