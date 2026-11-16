// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { CodeExample } from "./CodeExample.js";
import { render, screen } from "./render.harness.js";

const code = "<Button>\n  Save\n</Button>";

describe("CodeExample", () => {
  it("is one figure holding the preview, then the code", () => {
    render(<CodeExample code={code}>PREVIEW</CodeExample>);
    expect(screen.getByRole("figure").textContent).toBe(`PREVIEW${code}`);
  });

  it("shows the code as text, its markup escaped and its newlines kept", () => {
    render(<CodeExample code={code}>PREVIEW</CodeExample>);
    expect(screen.getByRole("code").textContent).toBe(code);
    expect(screen.queryByRole("button", { name: "Save" })).toBeNull();
  });

  it("has no copy button unless `copy` is set", () => {
    render(<CodeExample code="x">PREVIEW</CodeExample>);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("with `copy` has a copy button named by its label", () => {
    render(
      <CodeExample code="x" copy>
        PREVIEW
      </CodeExample>,
    );
    expect(screen.getByRole("button", { name: "Copy" }).getAttribute("type")).toBe("button");
  });

  it("puts a caption last, after the code, and none without one", () => {
    render(
      <>
        <CodeExample code="x" caption="NOTE">
          PREVIEW
        </CodeExample>
        <CodeExample code="y">PREVIEW</CodeExample>
      </>,
    );
    const [withCaption, without] = screen.getAllByRole("figure");
    expect(withCaption?.textContent).toBe("PREVIEWxNOTE");
    expect(without?.textContent).toBe("PREVIEWy");
  });
});
