import {
  Caption,
  Divider,
  MetaList,
  ProseLayout,
  Section,
  Stack,
  Text,
  TextLink,
} from "@slashsuite/ui-react";
import { type LegalDoc } from "../content/legal";
import { site } from "../content/site";

export function LegalPage({ doc }: { doc: LegalDoc }) {
  const other =
    doc.slug === "privacy"
      ? { href: "/terms", label: "Terms" }
      : { href: "/privacy", label: "Privacy" };

  return (
    <ProseLayout
      gap="lg"
      breadcrumbs={<TextLink href="/">{site.name}</TextLink>}
      title={doc.title}
      description={<>Last updated {doc.updated}</>}
    >
      {doc.sections.map((section) => (
        <Section key={section.heading} title={section.heading}>
          {section.paragraphs.map((para) => (
            <Text key={para}>{para}</Text>
          ))}
        </Section>
      ))}

      <footer className="mt-8">
        <Divider />
        <Stack gap="xs">
          <Caption>{site.legalName}</Caption>
          <MetaList>
            <TextLink href={`mailto:${site.contactEmail}`}>{site.contactEmail}</TextLink>
            <TextLink href={other.href}>{other.label}</TextLink>
          </MetaList>
        </Stack>
      </footer>
    </ProseLayout>
  );
}
