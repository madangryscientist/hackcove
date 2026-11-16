import type { Meta, StoryObj } from "@storybook/react-vite";
import { useLayoutEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
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

const longShops = Array.from({ length: 30 }, (_, i) => ({
  id: String(i + 1),
  name: `Market ${i + 1}`,
  text: "Stalls of second-hand goods, open on Saturdays.",
}));

type LongShop = (typeof longShops)[number];

/**
 * Thirty shops in one long grid. Only the cards near the screen carry a transition name, so the
 * browser captures what is visible, not the whole page, before the morph.
 */
function LongShops() {
  const [open, setOpen] = useState<LongShop | undefined>(undefined);
  const go = (next: LongShop | undefined) => startPageTransition(() => setOpen(next));
  return (
    <PageFade data-testid="long-page">
      {open ? (
        <Morph name="long" item={open.id} data-testid="long-detail">
          <Card
            title={open.name}
            size="lg"
            footer={
              <Button variant="outline" onClick={() => go(undefined)}>
                Back
              </Button>
            }
          >
            <Text as="p">{open.text}</Text>
          </Card>
        </Morph>
      ) : (
        <CardGrid>
          {longShops.map((shop) => (
            <Morph key={shop.id} name="long" item={shop.id} data-testid={`long-${shop.id}`}>
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

/** A long list of cards: only those near the screen are named, so the transition stays quick. */
export const LongList: S = { render: () => <LongShops /> };

const restoreShops = Array.from({ length: 40 }, (_, i) => ({
  id: String(i + 1),
  name: `Stall ${i + 1}`,
  text: "Second-hand goods, open on Saturdays.",
}));

type RestoreShop = (typeof restoreShops)[number];

// A router's view transition: the update is async, as a router awaits the route before it renders.
const routerTransition = (update: () => void) => {
  if (typeof document.startViewTransition !== "function") {
    update();
    return;
  }
  document
    .startViewTransition(async () => {
      await Promise.resolve();
      flushSync(update);
    })
    .ready.catch(() => {});
};

/**
 * Forty stalls in their own scroller, and one stall's page. Back remounts the list at the top, and
 * the parent's layout effect, which runs after the cards' own, then restores the scroll to the stall
 * that was opened, as a router's scroll restoration does. That card is far down when it mounts and
 * on screen when the browser captures the page, so it must carry its name by then to shrink back.
 */
function RestoreShops() {
  const [open, setOpen] = useState<RestoreShop | undefined>(undefined);
  const scroller = useRef<HTMLDivElement>(null);
  const saved = useRef(0);
  useLayoutEffect(() => {
    if (!open && scroller.current) scroller.current.scrollTop = saved.current;
  }, [open]);
  const go = (next: RestoreShop | undefined) => {
    if (next) saved.current = scroller.current?.scrollTop ?? 0;
    routerTransition(() => setOpen(next));
  };
  return (
    <div ref={scroller} className="h-96 overflow-y-auto">
      {open ? (
        <Morph name="restore" item={open.id}>
          <Card
            title={open.name}
            size="lg"
            footer={
              <Button variant="outline" onClick={() => go(undefined)}>
                Back
              </Button>
            }
          >
            <Text as="p">{open.text}</Text>
          </Card>
        </Morph>
      ) : (
        <Stack gap="md">
          {restoreShops.map((shop) => (
            <Morph key={shop.id} name="restore" item={shop.id} data-testid={`restore-${shop.id}`}>
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
        </Stack>
      )}
    </div>
  );
}

/** Back restores the list's scroll after it mounts, and the stall that was opened still shrinks into its place. */
export const BackRestoresScroll: S = { render: () => <RestoreShops /> };

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
