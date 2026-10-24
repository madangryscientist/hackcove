import { AppShell } from "@hackcove/ui";
import type { ReactNode } from "react";
import { site } from "../content/site";

/**
 * The page frame every page renders inside (1797): AppShell owns the header row, the content edge
 * and the side padding, so a component sets only its own reading measure. Static like the rest of
 * the site, so it ships no JS.
 */
export function SiteShell({
  children,
  footer,
  hideChromeInPrint = false,
}: {
  children: ReactNode;
  footer?: ReactNode;
  hideChromeInPrint?: boolean;
}) {
  return (
    <AppShell
      brand={<a href="/">{site.name}</a>}
      footer={footer}
      hideChromeInPrint={hideChromeInPrint}
    >
      {children}
    </AppShell>
  );
}
