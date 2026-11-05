import type { ReactNode } from "react";
import { Overline } from "@hackcove/ui-react";
import { ThemeFrame, themeNames } from "../.storybook/themes";

/** Every theme side by side, each in its own frame with its name over `children`. */
export function AllThemesGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(26rem,1fr))]">
      {themeNames.map((name) => (
        <ThemeFrame key={name} theme={name}>
          <Overline>{name}</Overline>
          {children}
        </ThemeFrame>
      ))}
    </div>
  );
}
