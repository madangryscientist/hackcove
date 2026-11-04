import { describe, expect, expectTypeOf, it } from "vitest";
import * as ui from "./index.js";
import type { TypographyProps } from "./index.js";

// Components take no `className` and no `style`: a consumer composes the parts and never restyles
// them. This is the type-level guard: every exported component's props must lack both keys.

type Ui = typeof ui;

/** The styling keys a props type accepts, over every member of a union of props. */
type Styling<P> = P extends unknown ? Extract<keyof P, "className" | "style"> : never;

/** The exported components (capitalised functions) whose props accept `className` or `style`. */
type Offenders = {
  [
    K in keyof Ui as K extends Capitalize<K & string>
      ? Ui[K] extends (props: infer P) => unknown
        ? [Styling<P>] extends [never]
          ? never
          : K
        : never
      : never
  ]: Styling<Ui[K] extends (props: infer P) => unknown ? P : never>;
};

describe("components take no className or style", () => {
  it("no exported component's props accept either", () => {
    expectTypeOf<Offenders>().toEqualTypeOf<{}>();
  });

  it("the polymorphic typography props accept neither, whatever element `as` picks", () => {
    expectTypeOf<Styling<TypographyProps<"p">>>().toEqualTypeOf<never>();
    expectTypeOf<Styling<TypographyProps<"a">>>().toEqualTypeOf<never>();
    expectTypeOf<Styling<TypographyProps<"h2">>>().toEqualTypeOf<never>();
  });

  it("every component is a function, so the check above covers it", () => {
    const components = Object.entries(ui).filter(([name]) => /^[A-Z]/.test(name));
    for (const [name, value] of components) {
      expect.soft(typeof value === "function", name).toBe(true);
    }
  });
});
