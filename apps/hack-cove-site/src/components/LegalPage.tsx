import { Body, Caption, PageHeader, Section, Stack } from "@hackcove/ui";
import { type LegalDoc } from "../content/legal";
import { site } from "../content/site";

export function LegalPage({ doc }: { doc: LegalDoc }) {
  const other =
    doc.slug === "privacy"
      ? { href: "/terms", label: "Terms" }
      : { href: "/privacy", label: "Privacy" };

  return (
    <div className="max-w-3xl">
      <PageHeader
        breadcrumbs={
          <a className="link text-sm" href="/">
            {site.name}
          </a>
        }
        title={doc.title}
        subtitle={<>Last updated {doc.updated}</>}
      />

      <Stack gap="lg">
        {doc.sections.map((section) => (
          <Section key={section.heading} title={section.heading}>
            {section.paragraphs.map((para) => (
              <Body key={para} as="p">
                {para}
              </Body>
            ))}
          </Section>
        ))}
      </Stack>

      <footer className="mt-16 border-t border-slate-200/70 pt-8">
        <Caption as="p">{site.legalName}</Caption>
        <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <a className="link" href={`mailto:${site.contactEmail}`}>
            {site.contactEmail}
          </a>
          <Caption aria-hidden="true">·</Caption>
          <a className="link" href={other.href}>
            {other.label}
          </a>
        </p>
      </footer>
    </div>
  );
}
