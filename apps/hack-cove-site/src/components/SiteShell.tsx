import { AppShell } from "@hackcove/ui";
import type { ReactNode } from "react";
import { site } from "../content/site";
import { SiteNav } from "./SiteNav";

/**
 * The page frame every page renders inside (1797): AppShell owns the header row, the content edge
 * and the side padding, so a component sets only its own reading measure. Static like the rest of
 * the site, so it ships no JS.
 */
export function SiteShell({
  children,
  footer,
  controls,
  pathname,
  bleed = false,
  hideChromeInPrint = false,
}: {
  children: ReactNode;
  footer?: ReactNode;
  /** The header's end slot: the docs' theme picker. */
  controls?: ReactNode;
  /** Main without its Container, for a page that is a `SidebarLayout`. */
  bleed?: boolean;
  /** The current path, so the nav can mark its section. */
  pathname: string;
  hideChromeInPrint?: boolean;
}) {
  return (
    <AppShell
      brand={<a href="/">{site.name}</a>}
      nav={<SiteNav pathname={pathname} />}
      footer={footer}
      controls={controls}
      bleed={bleed}
      hideChromeInPrint={hideChromeInPrint}
    >
      {children}
    </AppShell>
  );
}
