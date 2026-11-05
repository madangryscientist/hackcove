import type { ReactNode } from "react";
import { AppShell, Tabs, appShellRootClassFor } from "@hackcove/ui-react";

/** A Layout story's `beforeEach`: what an app does once on its own `<html>` (reserve the scrollbar), undone when the story is left. */
export function layoutPage(): () => void {
  const root = document.documentElement;
  // The light scheme adds no class, so this is only the shell's own root class.
  const shellClass = appShellRootClassFor("light");
  root.classList.add(shellClass);
  return () => root.classList.remove(shellClass);
}

const nav = ["Overview", "Builds", "Snapshots", "Reviews", "Projects", "Members", "Settings"];

/** An app's shell: the brand and a long nav in their slots (on a phone both are in its menu). Every Layout story renders inside it. */
export function DemoShell({
  brand,
  subnav,
  menuLabel,
  controls,
  footer,
  bleed = false,
  hideChromeInPrint = false,
  children,
}: {
  /** Replaces the default brand link. */
  brand?: ReactNode;
  subnav?: ReactNode;
  menuLabel?: string;
  controls?: ReactNode;
  footer?: ReactNode;
  bleed?: boolean;
  hideChromeInPrint?: boolean;
  children: ReactNode;
}) {
  return (
    <AppShell
      brand={
        brand ?? (
          <a href="#" aria-label="Hack Cove">
            Hack Cove
          </a>
        )
      }
      nav={
        <Tabs
          variant="pill"
          label="Main"
          items={nav.map((label, index) => ({ label, href: `#${label}`, active: index === 1 }))}
        />
      }
      controls={controls}
      subnav={subnav}
      {...(menuLabel === undefined ? {} : { menuLabel })}
      footer={footer}
      bleed={bleed}
      hideChromeInPrint={hideChromeInPrint}
    >
      {children}
    </AppShell>
  );
}
