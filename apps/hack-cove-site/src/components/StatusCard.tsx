import { Body, BulletList, Card, InlineLinks, Pill, Stack, TextLink } from "@hackcove/ui";
import type { Status } from "../content/site";

const STATUS = {
  available: { label: "Available", tone: "emerald" },
  "in-use": { label: "In use", tone: "emerald" },
  "coming-soon": { label: "Coming soon", tone: "amber" },
} as const;

/**
 * A card titled with a status pill, an optional summary, a bulleted list and optional links: a
 * project on the home page, a block of the PixelSlash page and the component docs on /ui/.
 */
export function StatusCard({
  title,
  status,
  summary,
  items = [],
  links,
}: {
  title: string;
  status: Status;
  summary?: string | undefined;
  items?: string[] | undefined;
  links?: { label: string; href: string }[] | undefined;
}) {
  const { label, tone } = STATUS[status];
  return (
    <Card as="article" title={title} status={<Pill tone={tone}>{label}</Pill>}>
      <Stack gap="sm">
        {summary && <Body as="p">{summary}</Body>}
        {items.length > 0 && (
          <BulletList>
            {items.map((item) => (
              <Body as="li" key={item} color="secondary">
                {item}
              </Body>
            ))}
          </BulletList>
        )}
        {links && links.length > 0 && (
          <InlineLinks separator="none">
            {links.map((link) => (
              <TextLink key={link.href} href={link.href}>
                {link.label}
              </TextLink>
            ))}
          </InlineLinks>
        )}
      </Stack>
    </Card>
  );
}
