import {
  Body,
  Caption,
  Divider,
  InlineLinks,
  PageHeader,
  Section,
  Stack,
  TextLink,
} from "@hackcove/ui";
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
          <TextLink className="text-sm" href="/">
            {site.name}
          </TextLink>
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

      <Divider className="mt-16" />
      <footer className="pt-8">
        <Caption as="p">{site.legalName}</Caption>
        <InlineLinks className="mt-2">
          <TextLink href={`mailto:${site.contactEmail}`}>{site.contactEmail}</TextLink>
          <TextLink href={other.href}>{other.label}</TextLink>
        </InlineLinks>
      </footer>
    </div>
  );
}
