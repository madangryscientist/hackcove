import {
  BulletList,
  Code,
  PageHeader,
  Section,
  Stack,
  SubsectionHeading,
  Text,
} from "@hackcove/ui";
import type { ComponentPage as Page } from "../content/components/index";
import { DoDont } from "../docs/DoDont";
import { Example } from "../docs/Example";
import { docOf, Props } from "../docs/Props";
import { Prose } from "../docs/Prose";

/** `OnePrimary` as `One primary`: the heading of a Do/Don't topic. */
function topicTitle(topic: string): string {
  const name = topic.split("/")[1] ?? topic;
  return name.replace(/(?<=[a-z])([A-Z])/g, (c) => ` ${c.toLowerCase()}`);
}

function Rules({ items }: { items: string[] }) {
  return (
    <BulletList>
      {items.map((item) => (
        <Text as="li" key={item}>
          <Prose text={item} />
        </Text>
      ))}
    </BulletList>
  );
}

/**
 * A component's page, from its entry in `content/components.ts`: the one right way and its Do/Don'ts
 * first, then a layout's full page, Usage, Accessibility and the API. `/ui/llms.txt` is made from the same entry.
 */
export function ComponentPage({ page }: { page: Page }) {
  return (
    <Stack gap="xl">
      <PageHeader title={page.name} subtitle={page.summary} />
      <Section title="Overview" gap="md">
        <Text as="p">
          <Prose text={page.whenToUse} />
        </Text>
        {page.pairs.map((topic) => (
          <Stack key={topic} gap="sm">
            <SubsectionHeading>{topicTitle(topic)}</SubsectionHeading>
            <DoDont of={topic} />
          </Stack>
        ))}
      </Section>
      {page.fullPage !== undefined && (
        <Section title="Full page" gap="md">
          <Example of={page.fullPage} />
        </Section>
      )}
      <Section title="Usage" gap="md">
        <Rules items={page.usage} />
      </Section>
      <Section title="Accessibility" gap="md">
        <Rules items={page.accessibility} />
      </Section>
      <Section title="API" gap="md">
        {page.api.map((name) => (
          <Props key={name} of={name} />
        ))}
        {page.functions !== undefined && page.functions.length > 0 && (
          <Stack gap="sm">
            <SubsectionHeading>Functions</SubsectionHeading>
            <BulletList>
              {page.functions.map((fn) => (
                <Text as="li" key={fn.name}>
                  <Code>{docOf(fn.name).signature ?? fn.name}</Code> <Prose text={fn.text} />
                </Text>
              ))}
            </BulletList>
          </Stack>
        )}
      </Section>
    </Stack>
  );
}
