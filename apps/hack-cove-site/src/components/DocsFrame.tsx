import { DocsLayout, type DocsHeading, type DocsNeighbour } from "@slashsuite/ui-react";
import type { ReactNode } from "react";
import { componentSections } from "../../../../packages/ui-react/docs/components/index";

const plain = (path: string) => (path.length > 1 ? path.replace(/\/+$/, "") : path);

/** The /ui/ pages' frame: a `DocsLayout` whose nav is Getting started, then the components grouped by section. */
export function DocsFrame({
  pathname,
  title,
  description,
  contents,
  previous,
  next,
  children,
}: {
  pathname: string;
  title: ReactNode;
  description?: ReactNode;
  contents?: DocsHeading[] | undefined;
  previous?: DocsNeighbour | undefined;
  next?: DocsNeighbour | undefined;
  children: ReactNode;
}) {
  const here = plain(pathname);
  const nav = [
    { items: [{ label: "Getting started", href: "/ui/", selected: here === "/ui" }] },
    ...componentSections.map((section) => ({
      title: section.title,
      items: section.pages.map((page) => ({
        label: page.name,
        href: `/ui/${page.slug}/`,
        selected: here === `/ui/${page.slug}`,
      })),
    })),
  ];
  return (
    <DocsLayout
      nav={nav}
      navLabel="All components"
      title={title}
      description={description}
      contents={contents}
      previous={previous}
      next={next}
    >
      {children}
    </DocsLayout>
  );
}
