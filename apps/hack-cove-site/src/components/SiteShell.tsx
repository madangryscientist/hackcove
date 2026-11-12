import { AppShell } from "@hackcove/ui-react";
import type { ReactNode } from "react";
import { Logo } from "./Logo";
import { SiteNav } from "./SiteNav";

/**
 * The page frame every page renders inside (1797): AppShell owns the header rows, the content edge
 * and the side padding, so a component sets only its own reading measure. The header is one row:
 * the brand, the section nav and the light/dark toggle, so the toggle stays on screen at any width
 * (on a phone AppShell folds the nav behind its Menu button). Static except for the toggle island.
 */
export function SiteShell({
  children,
  footer,
  controls,
  pathname,
  hideChromeInPrint = false,
}: {
  children: ReactNode;
  footer?: ReactNode;
  /** The header's end slot: the light/dark toggle. */
  controls?: ReactNode;
  /** The current path, so the nav can mark its section. */
  pathname: string;
  hideChromeInPrint?: boolean;
}) {
  return (
    <AppShell
      brand={
        <a href="/">
          <Logo />
        </a>
      }
      nav={<SiteNav pathname={pathname} />}
      footer={footer}
      controls={controls}
      hideChromeInPrint={hideChromeInPrint}
    >
      {children}
    </AppShell>
  );
}
