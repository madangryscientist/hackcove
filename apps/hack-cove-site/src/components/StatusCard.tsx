import {
  Body,
  BulletList,
  Card,
  InlineLinks,
  Pill,
  SubsectionHeading,
  TextLink,
} from "@hackcove/ui";
import type { Status } from "../content/site";

const STATUS = {
  available: { label: "Available", tone: "emerald" },
  "in-use": { label: "In use", tone: "emerald" },
  "coming-soon": { label: "Coming soon", tone: "amber" },
} as const;

/**
 * A titled card with a status pill, an optional summary, a bulleted list and optional links: a
 * project on the home page, and each block of the PixelSlash page.
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
    <Card as="article">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <SubsectionHeading>{title}</SubsectionHeading>
        <Pill tone={tone}>{label}</Pill>
      </div>
      {summary && (
        <Body as="p" className="mt-2">
          {summary}
        </Body>
      )}
      {items.length > 0 && (
        <BulletList className="mt-3">
          {items.map((item) => (
            <Body as="li" key={item} color="secondary">
              {item}
            </Body>
          ))}
        </BulletList>
      )}
      {links && links.length > 0 && (
        <InlineLinks separator="none" className="mt-4">
          {links.map((link) => (
            <TextLink key={link.href} href={link.href}>
              {link.label}
            </TextLink>
          ))}
        </InlineLinks>
      )}
    </Card>
  );
}
