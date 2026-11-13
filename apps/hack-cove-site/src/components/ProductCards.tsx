import {
  Button,
  Card,
  CardGrid,
  Display,
  Image,
  Lead,
  Overline,
  Pill,
  Stack,
  Text,
} from "@hackcove/ui-react";
import { site } from "../content/site";
import type { Product, Status } from "../content/site";

const STATUS = {
  available: { label: "Available now", tone: "emerald" },
  "early-development": { label: "In early development", tone: "amber" },
  "coming-soon": { label: "Coming soon", tone: "amber" },
} as const satisfies Record<Status, { label: string; tone: "emerald" | "amber" }>;

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
 * display size, its status, its pitch and its action, then its real screenshot, large.
 */
function Feature({ number, product }: { number: number; product: Product }) {
  const { slug, name, kind, status, pitch, action, image } = product;
  const { label, tone } = STATUS[status];
  const titleId = `product-${slug}`;
  return (
    <Stack as="section" gap="lg" aria-labelledby={titleId}>
      <Stack gap="sm" width="narrow">
        {/* A plain block, not a Stack, so the inline Overline sits right on the heading. */}
        <header>
          <Overline mono>
            {String(number).padStart(2, "0")} / {kind}
          </Overline>
          <Display as="h2" id={titleId}>
            {name}
          </Display>
        </header>
        <div>
          <Pill tone={tone}>{label}</Pill>
        </div>
        <Lead>{pitch}</Lead>
        <div>
          <ActionButton action={action} size="lg" />
        </div>
      </Stack>
      {image && <Image src={image.src} alt={image.alt} aspect="16:9" />}
    </Stack>
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
      <Text as="p">{pitch}</Text>
    </Card>
  );
}

/**
 * The home page, after slashslash.build: a display headline and a lead, then each product you can
 * use today as a numbered block with its screenshot, then what is still coming as a row of cards.
 */
export function ProductCards() {
  const { home, products } = site;
  const ready = products.filter((p) => p.status === "available");
  const coming = products.filter((p) => p.status !== "available");
  return (
    <Stack gap="xl">
      <Stack gap="sm" width="narrow">
        <header>
          <Overline mono>{home.overline}</Overline>
          <Display>{home.title}</Display>
        </header>
        <Lead>{home.lead}</Lead>
      </Stack>
      {ready.map((product, i) => (
        <Feature key={product.slug} number={i + 1} product={product} />
      ))}
      <Stack as="section" gap="lg" aria-labelledby="product-coming">
        <header>
          <Overline mono>{home.coming.overline}</Overline>
          <Display as="h2" id="product-coming">
            {home.coming.title}
          </Display>
        </header>
        {/* As many per row as fit at 17rem each, so a zoomed page drops a column instead of
            wrapping a card's status and action: three at 1280px. */}
        <CardGrid as="ul" columns="auto">
          {coming.map((product) => (
            <ComingCard key={product.slug} {...product} />
          ))}
        </CardGrid>
      </Stack>
    </Stack>
  );
}
