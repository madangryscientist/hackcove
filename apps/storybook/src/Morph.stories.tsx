import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import {
  Button,
  Card,
  CardGrid,
  Morph,
  PageFade,
  Stack,
  startPageTransition,
  Text,
} from "@hackcove/ui-react";

const meta: Meta = { title: "Feedback/Morph" };
export default meta;
type S = StoryObj;

const shops = [
  { id: "a", name: "Shop A", text: "Vintage denim and boots." },
  { id: "b", name: "Shop B", text: "Books, records and old maps." },
  { id: "c", name: "Shop C", text: "Kitchenware and linen." },
];

type Shop = (typeof shops)[number];

/**
 * A grid of shops and one shop's page. The route change stands in as a state change wrapped in
 * `startPageTransition`; a router's own view-transition option does the same job. Only the card
 * pressed has a partner on the next page, so it grows into the detail while the rest of the page
 * fades, and Back shrinks it into its place. Each story on the docs page uses its own `name`, as
 * two on one page with the same pair would skip the morph. The Do and Dont stories repeat their
 * render in full, as a doc snippet must stand alone.
 */
function Shops() {
  const [open, setOpen] = useState<Shop | undefined>(undefined);
  const go = (next: Shop | undefined) => startPageTransition(() => setOpen(next));
  return (
    <PageFade>
      {open ? (
        <Morph name="shop" item={open.id} data-testid="morph-detail">
          <Card
            title={open.name}
            size="lg"
            footer={
              <Button variant="outline" onClick={() => go(undefined)}>
                Back
              </Button>
            }
          >
            <Stack gap="sm">
              <Text as="p">{open.text}</Text>
              <Text as="p" color="muted">
                Open Tuesday to Saturday, 09:00 to 17:00.
              </Text>
            </Stack>
          </Card>
        </Morph>
      ) : (
        <CardGrid>
          {shops.map((shop) => (
            <Morph key={shop.id} name="shop" item={shop.id} data-testid={`morph-${shop.id}`}>
              <Card
                title={shop.name}
                footer={
                  <Button variant="outline" onClick={() => go(shop)}>
                    Open {shop.name}
                  </Button>
                }
              >
                <Text as="p" color="muted">
                  {shop.text}
                </Text>
              </Card>
            </Morph>
          ))}
        </CardGrid>
      )}
    </PageFade>
  );
}

/**
 * Press a shop: its card grows into the shop's page while the rest fades; Back shrinks it back.
 * With `prefers-reduced-motion: reduce`, or in a browser without View Transitions, it just swaps.
 */
export const Default: S = { render: () => <Shops /> };

/** Each card's `item` is its shop's id, so only the pressed card has a partner on the next page and it morphs. */
export const DoUniqueName: S = {
  render: () => {
    const [open, setOpen] = useState<string | undefined>(undefined);
    const letters = ["A", "B"];
    return open ? (
      <Morph name="shop-do" item={open}>
        <Card title={`Shop ${open}`} size="lg">
          <Button variant="outline" onClick={() => startPageTransition(() => setOpen(undefined))}>
            Back
          </Button>
        </Card>
      </Morph>
    ) : (
      <CardGrid columns={2}>
        {letters.map((shop) => (
          <Morph key={shop} name="shop-do" item={shop}>
            <Card title={`Shop ${shop}`}>
              <Button variant="outline" onClick={() => startPageTransition(() => setOpen(shop))}>
                Open Shop {shop}
              </Button>
            </Card>
          </Morph>
        ))}
      </CardGrid>
    );
  },
};

/** Every card shares one `item`, so the page holds the same name twice and the browser skips the morph. */
export const DontUniqueName: S = {
  render: () => {
    const [open, setOpen] = useState<string | undefined>(undefined);
    const letters = ["A", "B"];
    return open ? (
      <Morph name="shop-dont" item={"shop"}>
        <Card title={`Shop ${open}`} size="lg">
          <Button variant="outline" onClick={() => startPageTransition(() => setOpen(undefined))}>
            Back
          </Button>
        </Card>
      </Morph>
    ) : (
      <CardGrid columns={2}>
        {letters.map((shop) => (
          <Morph key={shop} name="shop-dont" item={"shop"}>
            <Card title={`Shop ${shop}`}>
              <Button variant="outline" onClick={() => startPageTransition(() => setOpen(shop))}>
                Open Shop {shop}
              </Button>
            </Card>
          </Morph>
        ))}
      </CardGrid>
    );
  },
};

/** The change goes through `startPageTransition`, so the browser has the old and the new page to morph between. */
export const DoTransition: S = {
  render: () => {
    const [open, setOpen] = useState<string | undefined>(undefined);
    const letters = ["A", "B"];
    return open ? (
      <Morph name="shop-transition-do" item={open}>
        <Card title={`Shop ${open}`} size="lg">
          <Button variant="outline" onClick={() => startPageTransition(() => setOpen(undefined))}>
            Back
          </Button>
        </Card>
      </Morph>
    ) : (
      <CardGrid columns={2}>
        {letters.map((shop) => (
          <Morph key={shop} name="shop-transition-do" item={shop}>
            <Card title={`Shop ${shop}`}>
              <Button variant="outline" onClick={() => startPageTransition(() => setOpen(shop))}>
                Open Shop {shop}
              </Button>
            </Card>
          </Morph>
        ))}
      </CardGrid>
    );
  },
};

/** A plain state change swaps the page at once: there is no transition to morph. */
export const DontTransition: S = {
  render: () => {
    const [open, setOpen] = useState<string | undefined>(undefined);
    const letters = ["A", "B"];
    return open ? (
      <Morph name="shop-transition-dont" item={open}>
        <Card title={`Shop ${open}`} size="lg">
          <Button variant="outline" onClick={() => setOpen(undefined)}>
            Back
          </Button>
        </Card>
      </Morph>
    ) : (
      <CardGrid columns={2}>
        {letters.map((shop) => (
          <Morph key={shop} name="shop-transition-dont" item={shop}>
            <Card title={`Shop ${shop}`}>
              <Button variant="outline" onClick={() => setOpen(shop)}>
                Open Shop {shop}
              </Button>
            </Card>
          </Morph>
        ))}
      </CardGrid>
    );
  },
};
