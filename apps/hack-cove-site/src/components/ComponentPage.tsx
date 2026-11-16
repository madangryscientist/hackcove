import {
  BulletItem,
  BulletList,
  Code,
  type DocsHeading,
  type DocsNeighbour,
  Prose,
  Section,
  Stack,
  SubsectionHeading,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Text,
  TextLink,
} from "@hackcove/ui-react";
import { useId } from "react";
import type { ComponentPage as Page } from "../content/components/index";
import { componentPageOf, neighboursOf } from "../content/components/index";
import { DoDont } from "../docs/DoDont";
import { Example } from "../docs/Example";
import { docOf, Props } from "../docs/Props";
import { InlineCode } from "../docs/InlineCode";

/** The page's top-level sections, in page order: the "On this page" list and the anchors it jumps to. */
export function contentsOf(page: Page): DocsHeading[] {
  return [
    { id: "overview", label: "Overview", level: 2 },
    ...(page.fullPage !== undefined
      ? [{ id: "full-page", label: "Full page", level: 2 as const }]
      : []),
    { id: "usage", label: "Usage", level: 2 },
    { id: "accessibility", label: "Accessibility", level: 2 },
    { id: "api", label: "API", level: 2 },
  ];
}

/** The component pages either side of this one in the rail, as the frame's previous and next links. */
export function neighbourLinksOf(page: Page): { previous?: DocsNeighbour; next?: DocsNeighbour } {
  const { previous, next } = neighboursOf(page.slug);
  return {
    ...(previous && { previous: { label: previous.name, href: `/ui/${previous.slug}/` } }),
    ...(next && { next: { label: next.name, href: `/ui/${next.slug}/` } }),
  };
}

/** `OnePrimary` as `One primary`: the heading of a Do/Don't topic. */
function topicTitle(topic: string): string {
  const name = topic.split("/")[1] ?? topic;
  return name.replace(/(?<=[a-z])([A-Z])/g, (c) => ` ${c.toLowerCase()}`);
}

/** A list of rules; `labelledBy` names it by its heading's id. */
function Rules({ items, labelledBy }: { items: string[]; labelledBy?: string | undefined }) {
  return (
    <BulletList aria-labelledby={labelledBy}>
      {items.map((item) => (
        <BulletItem key={item}>
          <InlineCode text={item} />
        </BulletItem>
      ))}
    </BulletList>
  );
}

/** The "Use instead" table: each sibling page, linked, with when to use it instead of this one. */
function UseInstead({ siblings }: { siblings: { slug: string; when: string }[] }) {
  return (
    <Stack gap="sm">
      <SubsectionHeading>Use instead</SubsectionHeading>
      <Table label="Use instead">
        <TableHead>
          <TableRow>
            <TableHeaderCell>Component</TableHeaderCell>
            <TableHeaderCell>When</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {siblings.map(({ slug, when }) => (
            <TableRow key={slug}>
              <TableCell tone="strong">
                <TextLink href={`/ui/${slug}/`}>{componentPageOf(slug).name}</TextLink>
              </TableCell>
              <TableCell>
                <InlineCode text={when} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Stack>
  );
}

/**
 * A component's page, from its entry in `content/components.ts`: the one right way and its Do/Don'ts
 * first, then a layout's full page, Usage, Accessibility and the API. Its title, contents and
 * neighbours go up to the `DocsFrame` (`contentsOf`, `neighbourLinksOf`). `/ui/llms.txt` is made from the same entry.
 */
export function ComponentPage({ page }: { page: Page }) {
  // Each usage list is named by its heading, so it is found by role and name.
  const doId = useId();
  const dontId = useId();
  return (
    <Prose>
      <Stack gap="xl">
        <Section id="overview" title="Overview" gap="md">
          <Text>
            <InlineCode text={page.whenToUse} />
          </Text>
          {page.siblings !== undefined && page.siblings.length > 0 && (
            <UseInstead siblings={page.siblings} />
          )}
          {page.pairs.map((topic) => (
            <Stack key={topic} gap="sm">
              <SubsectionHeading>{topicTitle(topic)}</SubsectionHeading>
              <DoDont of={topic} />
            </Stack>
          ))}
        </Section>
        {page.fullPage !== undefined && (
          <Section id="full-page" title="Full page" gap="md">
            <Example of={page.fullPage} copy />
          </Section>
        )}
        <Section id="usage" title="Usage" gap="md">
          <Stack gap="sm">
            <SubsectionHeading id={doId}>Do</SubsectionHeading>
            <Rules items={page.usage.do} labelledBy={doId} />
          </Stack>
          {page.usage.dont !== undefined && page.usage.dont.length > 0 && (
            <Stack gap="sm">
              <SubsectionHeading id={dontId}>Don't</SubsectionHeading>
              <Rules items={page.usage.dont} labelledBy={dontId} />
            </Stack>
          )}
        </Section>
        <Section id="accessibility" title="Accessibility" gap="md">
          <Rules items={page.accessibility} />
        </Section>
        <Section id="api" title="API" gap="md">
          {page.api.map((name) => (
            <Props key={name} of={name} />
          ))}
          {page.functions !== undefined && page.functions.length > 0 && (
            <Stack gap="sm">
              <SubsectionHeading>Functions</SubsectionHeading>
              <BulletList>
                {page.functions.map((fn) => (
                  <BulletItem key={fn.name}>
                    <Code>{docOf(fn.name).signature ?? fn.name}</Code> <InlineCode text={fn.text} />
                  </BulletItem>
                ))}
              </BulletList>
            </Stack>
          )}
        </Section>
      </Stack>
    </Prose>
  );
}
