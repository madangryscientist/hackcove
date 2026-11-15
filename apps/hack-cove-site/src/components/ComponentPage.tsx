import {
  BulletItem,
  BulletList,
  Cluster,
  Code,
  Overline,
  PageHeader,
  Prose,
  Section,
  Stack,
  SubsectionHeading,
  Text,
  TextLink,
  type ClusterJustify,
} from "@hackcove/ui-react";
import { useId } from "react";
import type { ComponentPage as Page } from "../content/components/index";
import { neighboursOf } from "../content/components/index";
import { DoDont } from "../docs/DoDont";
import { Example } from "../docs/Example";
import { docOf, Props } from "../docs/Props";
import { InlineCode } from "../docs/InlineCode";

/** The page's top-level sections, in page order: the "On this page" list and the anchors it jumps to. */
function sectionsOf(page: Page): { id: string; label: string }[] {
  return [
    { id: "overview", label: "Overview" },
    ...(page.fullPage !== undefined ? [{ id: "full-page", label: "Full page" }] : []),
    { id: "usage", label: "Usage" },
    { id: "accessibility", label: "Accessibility" },
    { id: "api", label: "API" },
  ];
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

/** The list of the page's own sections at its top, at every width: the index a long page needs. */
function OnThisPage({ sections }: { sections: { id: string; label: string }[] }) {
  return (
    <nav aria-label="On this page">
      <Overline>On this page</Overline>
      <Cluster gap="sm" wrap>
        {sections.map((section) => (
          <TextLink key={section.id} href={`#${section.id}`}>
            {section.label}
          </TextLink>
        ))}
      </Cluster>
    </nav>
  );
}

/** The way onwards at the foot of the page: the component pages either side of this one in the rail. */
function PreviousAndNext({
  previous,
  next,
}: {
  previous?: Page | undefined;
  next?: Page | undefined;
}) {
  if (!previous && !next) return null;
  // `between` with both, so they sit at the two ends; the one that exists sits at its own end.
  let justify: ClusterJustify = "start";
  if (previous && next) justify = "between";
  else if (next) justify = "end";
  return (
    <Cluster justify={justify}>
      {previous && <TextLink href={`/ui/${previous.slug}/`}>Previous: {previous.name}</TextLink>}
      {next && <TextLink href={`/ui/${next.slug}/`}>Next: {next.name}</TextLink>}
    </Cluster>
  );
}

/**
 * A component's page, from its entry in `content/components.ts`: the one right way and its Do/Don'ts
 * first, then a layout's full page, Usage, Accessibility and the API. `/ui/llms.txt` is made from the same entry.
 */
export function ComponentPage({ page }: { page: Page }) {
  const { previous, next } = neighboursOf(page.slug);
  // Each usage list is named by its heading, so it is found by role and name.
  const doId = useId();
  const dontId = useId();
  return (
    <Stack gap="xl">
      <PageHeader title={page.name} subtitle={page.summary} />
      <OnThisPage sections={sectionsOf(page)} />
      <Prose>
        <Stack gap="xl">
          <Section id="overview" title="Overview" gap="md">
            <Text>
              <InlineCode text={page.whenToUse} />
            </Text>
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
                      <Code>{docOf(fn.name).signature ?? fn.name}</Code>{" "}
                      <InlineCode text={fn.text} />
                    </BulletItem>
                  ))}
                </BulletList>
              </Stack>
            )}
          </Section>
        </Stack>
      </Prose>
      <PreviousAndNext previous={previous} next={next} />
    </Stack>
  );
}
