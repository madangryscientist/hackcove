import type { ReactNode } from "react";
import { AppShell, NavTabs, appShellRootClass } from "@hackcove/ui";

/** A Layout story's `beforeEach`: what an app does once on its own `<html>` (reserve the scrollbar), undone when the story is left. */
export function layoutPage(): () => void {
  const root = document.documentElement;
  root.classList.add(appShellRootClass);
  return () => root.classList.remove(appShellRootClass);
}

const nav = ["Overview", "Builds", "Snapshots", "Reviews", "Projects", "Members", "Settings"];

/** An app's shell: the logo, a long nav (it scrolls on a phone). Every Layout story renders inside it. */
export function DemoShell({
  subnav,
  footer,
  bleed = false,
  children,
}: {
  subnav?: ReactNode;
  footer?: ReactNode;
  bleed?: boolean;
  children: ReactNode;
}) {
  return (
    <AppShell
      header={
        <>
          <a href="#" aria-label="Hack Cove" className="text-sm font-semibold text-slate-900">
            Hack Cove
          </a>
          <NavTabs
            label="Main"
            items={nav.map((label, index) => ({ label, href: `#${label}`, active: index === 1 }))}
          />
        </>
      }
      subnav={subnav}
      footer={footer}
      bleed={bleed}
    >
      {children}
    </AppShell>
  );
}
