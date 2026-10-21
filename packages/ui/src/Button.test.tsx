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
