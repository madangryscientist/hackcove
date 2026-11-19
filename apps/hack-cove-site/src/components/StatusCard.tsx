import {
  BulletItem,
  BulletList,
  Card,
  MetaList,
  Pill,
  Stack,
  Text,
  TextLink,
} from "@slashsuite/ui-react";

const STATUS = {
  available: { label: "Available", tone: "positive" },
  "coming-soon": { label: "Coming soon", tone: "warn" },
} as const;

/**
 * A card titled with a status pill, an optional summary, a bulleted list and optional links, as on the
 * component docs on /ui/.
 */
export function StatusCard({
  title,
  status,
  summary,
  items = [],
  links,
}: {
  title: string;
  status: keyof typeof STATUS;
  summary?: string | undefined;
  items?: string[] | undefined;
  links?: { label: string; href: string }[] | undefined;
}) {
  const { label, tone } = STATUS[status];
  return (
    <Card as="article" title={title} status={<Pill tone={tone}>{label}</Pill>}>
      <Stack gap="sm">
        {summary && <Text>{summary}</Text>}
        {items.length > 0 && (
          <BulletList>
            {items.map((item) => (
              <BulletItem key={item}>{item}</BulletItem>
            ))}
          </BulletList>
        )}
        {links && links.length > 0 && (
          <MetaList separator="none">
            {links.map((link) => (
              <TextLink key={link.href} href={link.href}>
                {link.label}
              </TextLink>
            ))}
          </MetaList>
        )}
      </Stack>
    </Card>
  );
}
