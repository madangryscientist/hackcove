import {
  Button,
  Card,
  CardGrid,
  Image,
  PageHeader,
  Pill,
  Prose,
  Stack,
  Text,
} from "@hackcove/ui-react";
import { site } from "../content/site";
import type { Status } from "../content/site";

const STATUS = {
  available: { label: "Available now", tone: "emerald" },
  "early-development": { label: "In early development", tone: "amber" },
  "coming-soon": { label: "Coming soon", tone: "amber" },
} as const satisfies Record<Status, { label: string; tone: "emerald" | "amber" }>;

/**
 * The home page: a "Products" `h1` and one card per product in `site.products`, each with its status, its pitch, a
 * picture where a real one exists and the one action that links out to the product. The copy,
 * status, picture and link are edits to the content file. It is a reading page, so it sits on the
 * long-form scale, and `Prose` reaches only what renders inside it: hence it is here, in one tree.
 */
export function ProductCards() {
  return (
    <Prose>
      <Stack gap="xl">
        <PageHeader title="Products" />
        <CardGrid as="ul" columns={4}>
          {site.products.map(({ slug, name, status, pitch, action, image }) => {
            const { label, tone } = STATUS[status];
            return (
              <Card
                key={slug}
                as="article"
                titleStyle="name"
                title={name}
                status={<Pill tone={tone}>{label}</Pill>}
                inset={image && <Image src={image.src} alt={image.alt} aspect="natural" />}
                footer={
                  action && (
                    <Button href={action.href} variant="outline" external={action.external}>
                      {action.label}
                    </Button>
                  )
                }
              >
                <Text as="p">{pitch}</Text>
              </Card>
            );
          })}
        </CardGrid>
      </Stack>
    </Prose>
  );
}
