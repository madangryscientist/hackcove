import {
  BulletItem,
  BulletList,
  Button,
  Card,
  Caption,
  Code,
  CodeBlock,
  CodeExample,
  Divider,
  EmptyState,
  OutlineRegion,
  Prose,
  RegionFrame,
  SectionHeading,
  Step,
  Steps,
  SubsectionHeading,
  Overline,
  Text,
  Video,
} from "@hackcove/ui-react";
import { ProseDoc } from "./ProseDoc";
import { samplePhoto } from "./samplePhoto";
import { sampleShot, sampleShotSize } from "./sampleShot";
import { sampleVideo } from "./sampleVideo";

/** The options a text run takes: italic, a long string, alignment and a fixed amount width. */
function GalleryTextOptions() {
  return (
    <div className="flex flex-col gap-1">
      <Text italic tone="muted">
        An italic muted hint.
      </Text>
      <div className="w-40">
        <Caption breakWords>Caption breakWords: 0f3a9c1d7b2e4f60a8c5d9e1b3f7a2c4d6e8</Caption>
      </div>
      <div className="flex w-56 flex-col gap-1">
        <Overline align="end">Amount</Overline>
        <Text as="span" strong minWidth="amount">
          1,111.11
        </Text>
      </div>
    </div>
  );
}

/** An EmptyState with `padding="inset"` in a flush Card. */
function GalleryInsetEmpty() {
  return (
    <Card flush>
      <EmptyState title="EmptyState inset" padding="inset">
        <Text>In a flush card.</Text>
      </EmptyState>
    </Card>
  );
}

/** An EmptyState with a body, Steps and an action, then one with `padding="inset"` in a flush Card. */
function GalleryEmpty() {
  return (
    <>
      <EmptyState title="EmptyState" actions={<Button size="sm">Action</Button>}>
        <Text>A body line under the title.</Text>
        <Steps>
          <Step title="Steps, numbered by CSS">
            With a detail line and <Code>Code</Code>.
          </Step>
          <Step title="A second step" />
        </Steps>
      </EmptyState>
      <GalleryInsetEmpty />
    </>
  );
}

/** Text tones with numeric, mono and lines. */
function GalleryTones() {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap gap-x-4">
        <Text as="span" tone="positive">
          Saved.
        </Text>
        <Text as="span" tone="danger">
          Could not save.
        </Text>
        <Text as="span" tone="warn">
          Expires tomorrow.
        </Text>
        <Text as="span" tone="info">
          Syncing.
        </Text>
        <Caption as="span" tone="muted" numeric>
          1,111.11
        </Caption>
        <Caption as="span" mono>
          HC-130
        </Caption>
      </div>
      <div className="w-40">
        <Text lines={1}>Text lines={1} cuts a long line with an ellipsis.</Text>
      </div>
      <div className="w-56">
        <Text lines={2}>
          Text lines={2} wraps a long description and stops after the second line, ending in an
          ellipsis where the rest is cut.
        </Text>
      </div>
    </div>
  );
}

/** The text-level block of the Gallery: heading sizes, a ruled heading, preserved newlines, text tones with numeric, mono and lines, a list, an EmptyState with Steps, inline code, a CodeBlock, a CodeExample, a divider, a video and an OutlineRegion in a RegionFrame. */
export function GalleryText() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <SubsectionHeading size="md">SubsectionHeading md</SubsectionHeading>
        <SubsectionHeading size="lg">SubsectionHeading lg</SubsectionHeading>
        <div className="w-40">
          <SubsectionHeading truncate>SubsectionHeading truncated to one line</SubsectionHeading>
        </div>
      </div>
      <div>
        <SectionHeading rule description="SectionHeading description under the title.">
          SectionHeading rule
        </SectionHeading>
        <BulletList>
          <BulletItem>BulletList item</BulletItem>
          <BulletItem>
            Inline <Code>Code</Code> in an item
          </BulletItem>
        </BulletList>
      </div>
      <GalleryEmpty />
      <Text preserveNewlines>{"Text with preserveNewlines:\nthe second line of a note."}</Text>
      <GalleryTones />
      <GalleryTextOptions />
      <CodeBlock
        label="bash"
        language="bash"
        lines={["bun add @hackcove/ui-react", "bun install"]}
      />
      <CodeBlock copy label="bash" language="bash">
        bunx playwright test --project=chromium --reporter=list --output=out
      </CodeBlock>
      <CodeBlock copy overflow="scroll" label="bash" language="bash">
        bunx playwright test --project=chromium --reporter=list --output=out
      </CodeBlock>
      <CodeExample copy code={"<Button>Save</Button>"}>
        <Button>Save</Button>
      </CodeExample>
      <Divider />
      <div className="max-w-sm">
        <Video src={sampleVideo} poster={samplePhoto} />
      </div>
      <div className="max-w-sm">
        <RegionFrame src={sampleShot} alt="">
          <OutlineRegion
            rect={{ x: 228, y: 4, width: 80, height: 20 }}
            within={sampleShotSize}
            label="UI"
            hatched
          />
        </RegionFrame>
      </div>
      <div className="max-w-xl">
        <Prose>
          <ProseDoc />
        </Prose>
      </div>
    </div>
  );
}
