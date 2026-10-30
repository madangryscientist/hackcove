import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { Caption, Overline } from "@hackcove/ui";
import palette from "../../../packages/ui/palette.json";

const meta: Meta = { title: "Overview/Palette", parameters: { layout: "fullscreen" } };
export default meta;
type S = StoryObj;

const sample = (utility: string): ReactNode => {
  const base = utility.slice(utility.lastIndexOf(":") + 1);
  if (utility.includes(":")) return null; // a static story cannot show a state
  if (base.startsWith("bg-")) {
    return <div className={`h-10 w-16 rounded-md border border-slate-200 ${utility}`} />;
  }
  if (base.startsWith("text-")) {
    // text-violet-50 is the on-accent text: it is only visible on the accent fill.
    const backdrop = utility === "text-violet-50" ? "rounded-md bg-violet-600 px-2" : "";
    return <span className={`text-lg font-semibold ${backdrop} ${utility}`}>Aa</span>;
  }
  if (base.startsWith("border-")) {
    return <div className={`h-10 w-16 rounded-md border-2 ${utility}`} />;
  }
  if (base.startsWith("accent-")) {
    return <input type="checkbox" readOnly checked className={utility} />;
  }
  return null;
};

/** Every role in `@hackcove/ui`'s palette; follows the toolbar theme. */
export const Roles: S = {
  render: () => (
    <div className="flex flex-col gap-6 p-4">
      {Object.entries(palette).map(([role, utilities]) => (
        <section key={role} className="flex flex-col gap-2">
          <Overline>{role}</Overline>
          <div className="flex flex-wrap gap-4">
            {utilities.map((utility) => (
              <div key={utility} className="flex flex-col items-start gap-1">
                {sample(utility)}
                <Caption>{utility}</Caption>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  ),
};
