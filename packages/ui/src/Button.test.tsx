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

  it("passes type and disabled through", () => {
    const out = renderToStaticMarkup(
      <Button type="submit" disabled>
        Go
      </Button>,
    );
    expect(out).toContain('type="submit"');
    expect(out).toContain("disabled");
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

  it("blocked works on every boxed variant", () => {
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

describe("Button size", () => {
  it("is md by default: px-4 py-2 text-sm", () => {
    const out = html(<Button>Save</Button>);
    expect(out).toContain("px-4 py-2");
    expect(out).toContain("text-sm");
    expect(out).not.toContain("text-xs");
  });

  it("sm is compact: smaller padding and text-xs, with none of md's", () => {
    const out = html(<Button size="sm">Save</Button>);
    expect(out).toContain("px-2.5 py-1");
    expect(out).toContain("text-xs");
    expect(out).not.toContain("px-4");
    expect(out).not.toContain("text-sm");
  });
});

describe("Button tone", () => {
  it("danger primary is a solid red with the red hover", () => {
    const out = html(<Button tone="danger">Delete</Button>);
    expect(out).toContain("bg-red-600");
    expect(out).toContain("hover:bg-red-700");
    expect(out).not.toMatch(/(?:bg|border|text)-violet/);
  });

  it("danger outline and ghost are red text, no fill at rest", () => {
    const outline = html(
      <Button tone="danger" variant="outline">
        Clear
      </Button>,
    );
    expect(outline).toContain("border-red-200");
    expect(outline).toContain("text-red-700");
    expect(outline).not.toContain("bg-red-600");
    const ghost = html(
      <Button tone="danger" variant="ghost">
        Remove
      </Button>,
    );
    expect(ghost).toContain("border-transparent");
    expect(ghost).toContain("text-red-700");
  });

  it("danger is flat grey when blocked and keeps its colour when busy", () => {
    const blocked = html(
      <Button tone="danger" disabledReason="No">
        X
      </Button>,
    );
    expect(blocked).not.toContain("red");
    expect(blocked).toContain("cursor-not-allowed");
    const busy = html(
      <Button tone="danger" busy>
        X
      </Button>,
    );
    expect(busy).toContain("bg-red-600");
    expect(busy).toContain("cursor-progress");
  });
});

describe("Button link variant", () => {
  it("has no box: transparent border, no padding, underline on hover", () => {
    const out = html(<Button variant="link">Edit</Button>);
    expect(out).toContain("border-transparent");
    expect(out).toContain("text-violet-600");
    expect(out).toContain("hover:underline");
    expect(out).not.toContain("px-");
    expect(out).not.toContain("py-");
    expect(out).not.toContain("bg-");
  });

  it("takes the size's text and the danger tone", () => {
    const out = html(
      <Button variant="link" size="sm" tone="danger">
        Remove
      </Button>,
    );
    expect(out).toContain("text-xs");
    expect(out).toContain("text-red-700");
    expect(out).toContain("hover:underline");
  });

  it("blocked is grey text with no box", () => {
    const out = html(
      <Button variant="link" disabledReason="No">
        Edit
      </Button>,
    );
    expect(out).toContain("cursor-not-allowed");
    expect(out).toContain("text-slate-400");
    expect(out).toContain("border-transparent");
    expect(out).not.toContain("bg-slate-100");
    expect(out).not.toContain("hover:");
  });
});

describe("buttonClass options", () => {
  it("matches the Button's own classes", () => {
    const out = html(
      <Button variant="ghost" size="sm" tone="danger">
        X
      </Button>,
    );
    expect(out).toContain(buttonClass("ghost", { size: "sm", tone: "danger" }));
  });
});

describe("Button dashed variant", () => {
  it("is a full-width dashed outline with muted text, lit with the accent on hover", () => {
    const out = html(<Button variant="dashed">Add shot</Button>);
    expect(out).toContain("w-full");
    expect(out).toContain("border-dashed");
    expect(out).toContain("border-slate-300");
    expect(out).toContain("text-slate-500");
    expect(out).toContain("hover:border-violet-400");
    expect(out).toContain("hover:text-violet-700");
    expect(out).not.toContain("bg-");
  });

  it("takes the size scale", () => {
    expect(html(<Button variant="dashed">Add</Button>)).toContain("gap-2 px-4 py-2");
    expect(
      html(
        <Button variant="dashed" size="sm">
          Add
        </Button>,
      ),
    ).toContain("gap-1.5 px-2.5 py-1");
  });

  it("has one look: the danger tone does not recolour it", () => {
    const out = html(
      <Button variant="dashed" tone="danger">
        Add
      </Button>,
    );
    expect(out).toBe(html(<Button variant="dashed">Add</Button>));
  });

  it("blocked stays dashed and full width; busy keeps the colour", () => {
    const blocked = html(
      <Button variant="dashed" disabledReason="No room">
        Add
      </Button>,
    );
    expect(blocked).toContain("border-dashed");
    expect(blocked).toContain("w-full");
    expect(blocked).toContain("cursor-not-allowed");
    expect(blocked).not.toContain("hover:");
    const busy = html(
      <Button variant="dashed" busy>
        Add
      </Button>,
    );
    expect(busy).toContain("text-slate-500");
    expect(busy).toContain("border-dashed");
  });
});
