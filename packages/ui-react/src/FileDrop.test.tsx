// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { FileDrop } from "./FileDrop.js";
import { render, screen, user } from "./render.harness.js";

/** The file input, named by the prompt around it (a file input has no role of its own). */
const input = (prompt: string) => screen.getByLabelText<HTMLInputElement>(prompt);

describe("FileDrop", () => {
  it("is a file input named by the prompt around it", () => {
    render(<FileDrop>Drop a statement here</FileDrop>);
    expect(input("Drop a statement here").type).toBe("file");
  });

  it("sends everything to the input", () => {
    render(
      <FileDrop accept=".csv" multiple name="statement">
        Drop
      </FileDrop>,
    );
    expect(input("Drop").accept).toBe(".csv");
    expect(input("Drop").multiple).toBe(true);
    expect(input("Drop").name).toBe("statement");
  });

  it("takes the file a person picks", async () => {
    render(<FileDrop>Drop</FileDrop>);
    const file = new File(["a,b"], "statement.csv", { type: "text/csv" });
    await user().upload(input("Drop"), file);
    expect(input("Drop").files?.[0]).toBe(file);
  });

  it("disables the input", () => {
    render(<FileDrop disabled>Drop</FileDrop>);
    expect(input("Drop").disabled).toBe(true);
  });
});
