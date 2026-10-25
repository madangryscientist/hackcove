import { Body, Card, CardGrid, Code, InlineLinks, Section, Stack, TextLink } from "@hackcove/ui";
import { site } from "../content/site";
import { themes } from "../content/themes";
import { StatusCard } from "./StatusCard";

const { ui } = site;

function Install() {
  return (
    <Section title={ui.install.title} width="narrow">
      <Card>
        <Stack gap="md">
          {ui.install.steps.map((step) => {
            const lines = step.code === undefined ? [] : [step.code].flat();
            return (
              <Stack key={step.text} gap="xs">
                <Body as="p">{step.text}</Body>
                {lines.map((line) => (
                  <Body as="p" key={line}>
                    <Code>{line}</Code>
                  </Body>
                ))}
              </Stack>
            );
          })}
        </Stack>
      </Card>
    </Section>
  );
}

function Themes() {
  return (
    <Section title={ui.themes.title} width="narrow">
      <Body as="p">{ui.themes.intro}</Body>
      <CardGrid columns={2}>
        {themes.map((theme) => (
          <Card key={theme.folder} as="article" title={theme.title}>
            <Body as="p">{theme.description}</Body>
            <Body as="p" className="mt-3" color="tertiary">
              <Code>{theme.name}</Code>
            </Body>
            <Body as="p" className="mt-1" color="tertiary">
              {ui.themes.scopeLabel}: <Code>{theme.scopeClass}</Code>
            </Body>
          </Card>
        ))}
      </CardGrid>
    </Section>
  );
}

export function UiPage() {
  return (
    <>
      <Stack width="narrow" gap="md" className="pb-12 sm:pb-16">
        {ui.intro.map((paragraph) => (
          <Body as="p" key={paragraph}>
            {paragraph}
          </Body>
        ))}
      </Stack>
      <Stack gap="lg" className="pb-16 sm:pb-24">
        <Install />
        <Themes />
        <Section title={ui.links.title} width="narrow">
          <InlineLinks>
            {ui.links.items.map((link) => (
              <TextLink key={link.href} href={link.href}>
                {link.label}
              </TextLink>
            ))}
          </InlineLinks>
        </Section>
        <Stack width="narrow">
          <StatusCard title={ui.docs.title} status={ui.docs.status} summary={ui.docs.text} />
        </Stack>
      </Stack>
    </>
  );
}
