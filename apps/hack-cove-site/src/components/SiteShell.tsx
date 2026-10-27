import { AppShell } from "@hackcove/ui";
import type { ReactNode } from "react";
import { Logo } from "./Logo";
import { SiteNav } from "./SiteNav";

/**
 * The page frame every page renders inside (1797): AppShell owns the header rows, the content edge
 * and the side padding, so a component sets only its own reading measure. The header is the brand
 * and the theme picker on top and the section nav under them, so the picker stays on screen at any
 * width. Static except for the picker island.
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
  /** The header's end slot: the theme picker. */
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
      subnav={<SiteNav pathname={pathname} />}
      footer={footer}
      controls={controls}
      hideChromeInPrint={hideChromeInPrint}
    >
      {children}
    </AppShell>
  );
}
