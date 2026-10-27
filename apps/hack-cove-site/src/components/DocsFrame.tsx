import { NavTabs, Overline, SidebarLayout, Stack, type NavTab } from "@hackcove/ui";
import type { ReactNode } from "react";
import { componentSections } from "../content/components/index";

const plain = (path: string) => (path.length > 1 ? path.replace(/\/+$/, "") : path);

/** The /ui/ pages' frame: Getting started, then the components grouped by section as vertical link rails on the page, the page beside them (folded behind a disclosure on a phone, so the page comes first), in the same grid as the header. */
export function DocsFrame({ pathname, children }: { pathname: string; children: ReactNode }) {
  const here = plain(pathname);
  const start: NavTab[] = [{ label: "Getting started", href: "/ui/", active: here === "/ui" }];
  return (
    <SidebarLayout
      railLabel="All components"
      rail={
        <Stack gap="md">
          <NavTabs orientation="vertical" label="Docs" items={start} />
          {componentSections.map((section) => (
            <Stack key={section.title} gap="xs">
              <Overline>{section.title}</Overline>
              <NavTabs
                orientation="vertical"
                label={section.title}
                items={section.pages.map((page) => ({
                  label: page.name,
                  href: `/ui/${page.slug}/`,
                  active: here === `/ui/${page.slug}`,
                }))}
              />
            </Stack>
          ))}
        </Stack>
      }
    >
      {children}
    </SidebarLayout>
  );
}
