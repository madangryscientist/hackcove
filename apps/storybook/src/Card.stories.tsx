import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Button,
  ButtonGroup,
  Card,
  CardGrid,
  type LinkRenderProps,
  ListRow,
  Pill,
  Stack,
  SubsectionHeading,
  Text,
  TextLink,
} from "@hackcove/ui";
import { SampleTable } from "./sampleTable";

const meta: Meta = { title: "UI/Card" };
export default meta;
type S = StoryObj;

/** Stands in for a router's <Link to>: takes `to`, spreads the rest on an anchor. */
function FakeLink({ to, ...rest }: { to: string } & LinkRenderProps) {
  return <a href={`#${to}`} {...rest} />;
}

/** `status` puts a Pill directly beside the title; `actions` stays at the far end. */
export const DoStatus: S = {
  render: () => (
    <Card title="PixelSlash" status={<Pill tone="amber">Coming soon</Pill>}>
      <Text as="p" color="muted">
        Visual review for every pull request.
      </Text>
    </Card>
  ),
};

/** A hand-built title row drifts from every other Card's: use `title` and `status`. */
export const DontStatus: S = {
  render: () => (
    <Card>
      <SubsectionHeading>PixelSlash</SubsectionHeading>
      <Pill tone="amber">Coming soon</Pill>
      <Text as="p" color="muted">
        Visual review for every pull request.
      </Text>
    </Card>
  ),
};

/** A `Stack` spaces the Cards; the gap is the one the whole library uses. */
export const DoSpacing: S = {
  render: () => (
    <Stack>
      <Card title="Open" count={3}>
        <Text as="p" color="muted">
          Three things to do.
        </Text>
      </Card>
      <Card title="Done" count={12}>
        <Text as="p" color="muted">
          Twelve things finished.
        </Text>
      </Card>
    </Stack>
  ),
};

/** Cards with nothing between them butt together. Space them with `Stack` or `CardGrid`. */
export const DontSpacing: S = {
  render: () => (
    <>
      <Card title="Open" count={3}>
        <Text as="p" color="muted">
          Three things to do.
        </Text>
      </Card>
      <Card title="Done" count={12}>
        <Text as="p" color="muted">
          Twelve things finished.
        </Text>
      </Card>
    </>
  ),
};

/** `status` puts a Pill (or any node) directly beside the title; `actions` stays at the far end. */
export const Status: S = {
  render: () => (
    <div className="flex max-w-md flex-col gap-4">
      <Card title="Hack Cove UI" status={<Pill tone="emerald">Available</Pill>}>
        <Text as="p" color="muted">
          Components and themes, designed together.
        </Text>
      </Card>
      <Card
        bar
        title="PixelSlash"
        status={<Pill tone="amber">Coming soon</Pill>}
        actions={
          <Button size="sm" variant="outline">
            Join
          </Button>
        }
      >
        <p className="text-sm text-slate-700">Status beside the title, action at the end.</p>
      </Card>
    </div>
  ),
};

export const Flush: S = {
  render: () => (
    <div className="max-w-md">
      <Card flush>
        <SampleTable />
      </Card>
    </div>
  ),
};

export const HeaderBar: S = {
  render: () => (
    <div className="max-w-md">
      <Card
        bar
        flush
        title="Bills"
        count={3}
        actions={
          <Button size="sm" variant="outline">
            Add
          </Button>
        }
      >
        <SampleTable />
      </Card>
    </div>
  ),
};

export const HeaderBarPadded: S = {
  render: () => (
    <div className="max-w-md">
      <Card bar title="Notes" actions={<Button size="sm">Save</Button>}>
        <p className="text-sm text-slate-700">A padded body under the tinted strip.</p>
      </Card>
    </div>
  ),
};

export const Dashed: S = {
  render: () => (
    <div className="max-w-md">
      <Card dashed>No statements yet. Import one to get started.</Card>
    </div>
  ),
};

/** `dashed="filled"`: the dashed outline on a surface fill with more padding, for an empty state that reads as a panel. */
export const DashedFilled: S = {
  render: () => (
    <div className="max-w-md">
      <Card dashed="filled">No statements yet. Import one to get started.</Card>
    </div>
  ),
};

/** `size="sm"`: dense padding, the same word on `ListRow` and `FileDrop`. */
export const Small: S = {
  render: () => (
    <div className="flex max-w-md flex-col gap-4">
      <Card size="sm" title="Open" count={3}>
        <p className="text-sm text-slate-700">A dense panel.</p>
      </Card>
      <Card size="sm" bar title="Notes" actions={<Button size="sm">Save</Button>}>
        <p className="text-sm text-slate-700">A dense body under the strip.</p>
      </Card>
      <Card size="sm" dashed>
        Nothing here yet.
      </Card>
    </div>
  ),
};

/** `tone`: a soft fill and border in the Callout's set, for a data panel with a status. A message is still a `Callout`. */
export const Tones: S = {
  render: () => (
    <div className="flex max-w-md flex-col gap-4">
      {(["neutral", "info", "positive", "warn", "danger"] as const).map((tone) => (
        <Card key={tone} tone={tone} title={tone} count={2}>
          <p className="text-sm text-slate-700">R 12 400 forecast for the month.</p>
        </Card>
      ))}
      <Card tone="warn" size="sm" flush>
        <ListRow size="sm" trailing="R 1 850">
          Transport
        </ListRow>
      </Card>
    </div>
  ),
};

/** `href` makes the whole card one link: a hover border and the focus ring on the card itself. */
export const Link: S = {
  render: () => (
    <CardGrid>
      <Card href="#shot-1" title="Dashboard" status={<Pill tone="amber">changed</Pill>}>
        <Text as="p" color="muted">
          Open the diff for this shot.
        </Text>
      </Card>
      <Card href="#shot-2" title="Settings">
        <Text as="p" color="muted">
          Unchanged.
        </Text>
      </Card>
    </CardGrid>
  ),
};

/** A Card with an `id` is an anchor target: a link to `#billing` scrolls it clear of the sticky header and outlines it in violet while it is the target. */
export const AnchorTarget: S = {
  render: () => (
    <div className="flex max-w-md flex-col gap-4">
      <TextLink href="#billing">Jump to billing</TextLink>
      <Card id="billing" title="Billing">
        <Text as="p" color="muted">
          This card is the target of the link above.
        </Text>
      </Card>
    </div>
  ),
  play: () => {
    window.location.hash = "billing";
  },
};

/** `render` draws the app's own router `<Link>`, already carrying the card's classes. */
export const LinkRender: S = {
  render: () => (
    <div className="max-w-md">
      <Card render={(p) => <FakeLink to="/shots/1" {...p} />} title="Dashboard">
        <Text as="p" color="muted">
          The router Link is the card.
        </Text>
      </Card>
    </div>
  ),
};

/** `footer` is a tinted strip under a hairline, for the card's own actions or a total. */
export const Footer: S = {
  render: () => (
    <div className="flex max-w-md flex-col gap-4">
      <Card
        title="Invoice 2041"
        footer={
          <>
            <span className="text-sm text-slate-500">Due 3 Nov</span>
            <span className="ml-auto flex gap-2">
              <Button size="sm" variant="outline">
                Edit
              </Button>
              <Button size="sm">Send</Button>
            </span>
          </>
        }
      >
        <p className="text-sm text-slate-700">Three line items, R 12 400.</p>
      </Card>
      <Card
        bar
        flush
        title="Bills"
        count={2}
        footer={<span className="text-sm text-slate-500">Total R 11 350</span>}
      >
        <SampleTable />
      </Card>
      <Card size="sm" footer={<span className="text-xs text-slate-500">Dense</span>}>
        <p className="text-sm text-slate-700">The same strip at the dense padding.</p>
      </Card>
    </div>
  ),
};

/** A `ButtonGroup` in the footer spans it, so `end` sits at the far edge, as it does in the body. */
export const FooterWithButtonGroupEnd: S = {
  name: "Footer with ButtonGroup end",
  render: () => (
    <div className="flex max-w-md flex-col gap-4">
      <Card
        title="Quote 118"
        footer={
          <ButtonGroup end={<Button variant="outline">Edit</Button>}>
            <Button>Send</Button>
            <Button variant="outline">Duplicate</Button>
          </ButtonGroup>
        }
      >
        <p className="text-sm text-slate-700">Edit is flush with the footer's right padding.</p>
      </Card>
    </div>
  ),
};

/** In a stretched `CardGrid` row the footer stays at the foot of the shorter card. */
export const FooterInGrid: S = {
  render: () => (
    <CardGrid columns={2}>
      <Card title="Short" footer={<Button size="sm">Open</Button>}>
        <p className="text-sm text-slate-700">One line.</p>
      </Card>
      <Card title="Long" footer={<Button size="sm">Open</Button>}>
        <p className="text-sm text-slate-700">
          A longer body that wraps onto several lines so this card sets the height of the row, and
          the footer beside it stays level at the bottom.
        </p>
      </Card>
    </CardGrid>
  ),
};

/** `sm`, `md` (the default) and `lg`: the padding of the body and the header bar. */
export const Sizes: S = {
  render: () => (
    <div className="flex max-w-md flex-col gap-4">
      {(["sm", "md", "lg"] as const).map((size) => (
        <Card key={size} size={size} title={`Open, ${size}`} count={3}>
          <Text as="p" color="muted">
            Three things to do.
          </Text>
        </Card>
      ))}
    </div>
  ),
};
