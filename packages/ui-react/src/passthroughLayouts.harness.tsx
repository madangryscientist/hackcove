import type { ReactElement } from "react";
import * as ui from "./index.js";

/** The side-column layouts' cases of `CASES` (`passthrough.harness.tsx`), each given the probe attributes `a`. */
export function layoutCases(a: Record<string, string>): Record<string, () => ReactElement> {
  return {
    SideColumn: () => (
      <ui.SideColumn aside="a" {...a}>
        x
      </ui.SideColumn>
    ),
    SidebarLayout: () => (
      <ui.SidebarLayout aside="r" {...a}>
        x
      </ui.SidebarLayout>
    ),
    DocsLayout: () => (
      <ui.DocsLayout nav={[]} navLabel="Docs" title="t" {...a}>
        x
      </ui.DocsLayout>
    ),
  };
}
