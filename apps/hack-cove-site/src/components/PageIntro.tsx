import { PageHeader, Stack } from "@hackcove/ui";

/** The title and subtitle that open a section page, at the site's reading measure. */
export function PageIntro({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <Stack width="narrow">
      <PageHeader title={title} subtitle={subtitle} />
    </Stack>
  );
}
