import {
  Body,
  BulletList,
  Button,
  Code,
  CodeBlock,
  CodeExample,
  Divider,
  SectionHeading,
  SubsectionHeading,
  Video,
} from "@hackcove/ui";
import { samplePhoto } from "./samplePhoto";
import { sampleVideo } from "./sampleVideo";

/** The text-level block of the Gallery: heading sizes, a ruled heading, preserved newlines, a list, inline code, a CodeBlock, a CodeExample, a divider and a video. */
export function GalleryText() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <SubsectionHeading size="base">SubsectionHeading base</SubsectionHeading>
        <SubsectionHeading size="lg">SubsectionHeading lg</SubsectionHeading>
      </div>
      <div>
        <SectionHeading rule>SectionHeading rule</SectionHeading>
        <BulletList>
          <Body as="li">BulletList item</Body>
          <Body as="li">
            Inline <Code>Code</Code> in an item
          </Body>
        </BulletList>
      </div>
      <Body as="p" preserveNewlines>
        {"Body with preserveNewlines:\nthe second line of a note."}
      </Body>
      <CodeBlock label="bash" lines={["bun add @hackcove/ui", "bun install"]} />
      <CodeExample code={"<Button>Save</Button>"}>
        <Button>Save</Button>
      </CodeExample>
      <Divider />
      <div className="max-w-sm">
        <Video src={sampleVideo} poster={samplePhoto} />
      </div>
    </div>
  );
}
