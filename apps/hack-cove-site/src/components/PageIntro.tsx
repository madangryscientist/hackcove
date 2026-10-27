import { PageHeader } from "@hackcove/ui";

/** The title and subtitle that open a section page; a child of the page's `Stack gap="xl"`. */
export function PageIntro({ title, subtitle }: { title: string; subtitle: string }) {
  return <PageHeader title={title} subtitle={subtitle} />;
}
