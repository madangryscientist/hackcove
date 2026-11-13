import {
  BulletList,
  Button,
  ButtonGroup,
  Callout,
  Caption,
  Card,
  CardGrid,
  Cluster,
  Code,
  CodeBlock,
  CopyLine,
  Display,
  Lead,
  MetaList,
  Overline,
  Pill,
  RegionFrame,
  Section,
  Stack,
  Step,
  Steps,
  Text,
  TextLink,
} from "@hackcove/ui-react";
import { site } from "../content/site";

const { pixelslash } = site;
const { links } = pixelslash;

/** Get started and GitHub: the hero's and the closing section's calls to action. */
function Actions() {
  return (
    <ButtonGroup>
      <Button href={links.docs.href} size="lg">
        {links.docs.label}
      </Button>
      <Button href={links.github.href} size="lg" variant="outline">
        {links.github.label}
      </Button>
    </ButtonGroup>
  );
}

/**
 * The top of /pixelslash/: what it is, the badges, the calls to action and the install line. It is
 * the page's one island (`client:load`), because the install line's copy button needs a click
 * handler; everything under it is static.
 */
export function PixelSlashHero() {
  const { hero } = pixelslash;
  return (
    <Stack gap="lg" width="narrow">
      <Stack gap="sm">
        {/* A plain block, not a Stack: the Overline is an inline span (see Hero.tsx). */}
        <header>
          <Overline>PixelSlash</Overline>
          <Display>{hero.title}</Display>
        </header>
        <Lead>{hero.lead}</Lead>
      </Stack>
      <Cluster wrap>
        {hero.pills.map((pill) => (
          <Pill key={pill.label} tone={pill.tone} round>
            {pill.label}
          </Pill>
        ))}
      </Cluster>
      <Actions />
      <Stack gap="xs">
        <CopyLine text={hero.install} />
        <Caption>{hero.installNote}</Caption>
      </Stack>
    </Stack>
  );
}

function Report() {
  const { report } = pixelslash;
  return (
    <figure>
      <Stack gap="xs">
        <RegionFrame
          src={report.src}
          alt={report.alt}
          width={report.width}
          height={report.height}
        />
        <Caption as="figcaption">{report.caption}</Caption>
      </Stack>
    </figure>
  );
}

function HowItWorks() {
  const { how } = pixelslash;
  return (
    <Section title={how.title}>
      <Steps>
        {how.steps.map((step) => (
          <Step key={step.title} title={step.title}>
            {step.text}
          </Step>
        ))}
      </Steps>
    </Section>
  );
}

/** A grid of cards, each a command or flag in code and what it does for you. */
function CommandGrid({ items }: { items: { title: string; code: string; text: string }[] }) {
  return (
    <CardGrid columns={3} as="ul">
      {items.map((item) => (
        <Card key={item.title} as="article" title={item.title}>
          <Stack gap="sm">
            <Text as="p">
              <Code>{item.code}</Code>
            </Text>
            <Text as="p">{item.text}</Text>
          </Stack>
        </Card>
      ))}
    </CardGrid>
  );
}

/**
 * For a team whose own Playwright suite takes the shots: the package, one `snapshot()` call and the
 * upload. Full width under the grid, because a code block does not fit a grid cell.
 */
function PlaywrightCard() {
  const { playwright } = pixelslash.features;
  return (
    <Card as="article" title={playwright.title}>
      <Stack gap="sm">
        <Text as="p">{playwright.intro}</Text>
        <CodeBlock lines={[playwright.install]} label="bash" language="bash" />
        <CodeBlock language="ts">{playwright.example}</CodeBlock>
        <Text as="p">
          <Code>ignore</Code> {playwright.ignore}
        </Text>
        <Text as="p">{playwright.upload}</Text>
        <CodeBlock lines={[playwright.command]} label="bash" language="bash" />
        <TextLink href={links.playwright.href}>{links.playwright.label}</TextLink>
      </Stack>
    </Card>
  );
}

function Features() {
  const { features } = pixelslash;
  return (
    <Section title={features.title}>
      <CommandGrid items={features.items} />
      <PlaywrightCard />
    </Section>
  );
}

function ForCi() {
  const { ci } = pixelslash;
  return (
    <Section title={ci.title}>
      <Text as="p">{ci.intro}</Text>
      <CommandGrid items={ci.items} />
    </Section>
  );
}

/** A titled bullet list with links under it: the privacy and the source-available block. */
function Points({
  title,
  items,
  more,
}: {
  title: string;
  items: string[];
  more: { label: string; href: string }[];
}) {
  return (
    <Card as="article" title={title}>
      <Stack gap="sm">
        <BulletList>
          {items.map((item) => (
            <Text as="li" key={item} color="secondary">
              {item}
            </Text>
          ))}
        </BulletList>
        <MetaList nowrap separator="none">
          {more.map((link) => (
            <TextLink key={link.href} href={link.href}>
              {link.label}
            </TextLink>
          ))}
        </MetaList>
      </Stack>
    </Card>
  );
}

function Proof() {
  const { proof } = pixelslash;
  return (
    <Callout
      tone="positive"
      title={proof.title}
      actions={<TextLink href={proof.link.href}>{proof.link.label}</TextLink>}
    >
      {proof.text}
    </Callout>
  );
}

function Closing() {
  const { closing } = pixelslash;
  return (
    <Section title={closing.title}>
      <Text as="p">{closing.text}</Text>
      <CodeBlock lines={closing.code} label="bash" language="bash" />
      <Actions />
    </Section>
  );
}

/** Everything under the hero: the report as proof, then what it does, for whom and on what terms. */
export function PixelSlashPage() {
  const { privacy, free } = pixelslash;
  return (
    <Stack gap="xl">
      <Report />
      <HowItWorks />
      <Features />
      <ForCi />
      <CardGrid columns={2}>
        <Points title={privacy.title} items={privacy.items} more={[links.security]} />
        <Points
          title={free.title}
          items={free.items}
          more={[links.github, links.selfHost, links.pricing]}
        />
      </CardGrid>
      <Proof />
      <Closing />
    </Stack>
  );
}
