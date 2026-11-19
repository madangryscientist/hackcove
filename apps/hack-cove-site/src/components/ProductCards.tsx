import {
  BulletItem,
  BulletList,
  Button,
  Card,
  CardGrid,
  CodeBlock,
  Hero,
  Image,
  Lead,
  Overline,
  Pill,
  Section,
  Stack,
  Text,
} from "@hackcove/ui-react";
import { site } from "../content/site";
import type { Product, Status } from "../content/site";

const STATUS = {
  available: { label: "Available now", tone: "positive" },
  "early-development": { label: "In early development", tone: "warn" },
  "coming-soon": { label: "Coming soon", tone: "warn" },
} as const satisfies Record<Status, { label: string; tone: "positive" | "warn" }>;

function ActionButton({ action, size }: Pick<Product, "action"> & { size?: "lg" }) {
  if (!action) return null;
  return (
    <Button href={action.href} variant="outline" size={size} external={action.external}>
      {action.label}
    </Button>
  );
}

/**
 * A product you can use today, across the page: a number and what it is over its name at
 * display size, its status, its pitch, what it does and its action, then its real screenshot,
 * large, or its real terminal output where it has no screenshot.
 */
function Feature({ number, product }: { number: number; product: Product }) {
  const { slug, name, kind, status, pitch, action, image, sample, features } = product;
  const { label, tone } = STATUS[status];
  const titleId = `product-${slug}`;
  return (
    <Section
      size="lg"
      id={titleId}
      overline={`${String(number).padStart(2, "0")} / ${kind}`}
      title={name}
      description={pitch.text}
    >
      <Stack gap="sm" width="narrow">
        <div>
          <Pill tone={tone}>{label}</Pill>
        </div>
        {features && (
          <BulletList>
            {features.map((feature) => (
              <BulletItem key={feature.text}>{feature.text}</BulletItem>
            ))}
          </BulletList>
        )}
        <div>
          <ActionButton action={action} size="lg" />
        </div>
      </Stack>
      {image && <Image src={image.src} alt={image.alt} aspect="16:9" />}
      {sample && <CodeBlock label={sample.label} language="console" lines={sample.lines} />}
    </Section>
  );
}

/** How the slash tools fit: each one's question about a change, the tool, and how it answers. */
function Fit() {
  const { overline, title, lead, questions } = site.home.fit;
  return (
    <Section size="lg" id="product-fit" overline={overline} title={title} description={lead}>
      <CardGrid as="ul" columns="auto">
        {questions.map(({ question, product, answer }) => (
          <Card as="article" key={product} titleStyle="name" title={question}>
            <Stack gap="xs">
              <div>
                <Overline mono>{product}</Overline>
              </div>
              <Text>{answer.text}</Text>
            </Stack>
          </Card>
        ))}
      </CardGrid>
    </Section>
  );
}

/** A product still to come: a card with its name, status, pitch and, where it has one, its link. */
function ComingCard({ name, status, pitch, action }: Product) {
  const { label, tone } = STATUS[status];
  return (
    <Card
      as="article"
      titleStyle="name"
      title={name}
      status={<Pill tone={tone}>{label}</Pill>}
      footer={action && <ActionButton action={action} />}
    >
      <Text>{pitch.text}</Text>
    </Card>
  );
}

/**
 * The home page, after slashslash.build: a display headline and a lead, then each product you can
 * use today as a numbered block with its screenshot, how the slash tools fit together, then what
 * is still coming as a row of cards.
 */
export function ProductCards() {
  const { home, products } = site;
  const ready = products.filter((p) => p.status === "available");
  const coming = products.filter((p) => p.status !== "available");
  return (
    <Stack gap="xl">
      <Hero overline={home.overline} title={home.title}>
        <Lead>{home.lead.text}</Lead>
      </Hero>
      {ready.map((product, i) => (
        <Feature key={product.slug} number={i + 1} product={product} />
      ))}
      <Fit />
      <Section
        size="lg"
        id="product-coming"
        overline={home.coming.overline}
        title={home.coming.title}
      >
        {/* As many per row as fit at 17rem each, so a zoomed page drops a column instead of
            wrapping a card's status and action: three at 1280px. */}
        <CardGrid as="ul" columns="auto">
          {coming.map((product) => (
            <ComingCard key={product.slug} {...product} />
          ))}
        </CardGrid>
      </Section>
    </Stack>
  );
}
