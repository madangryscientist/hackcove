import { Body, Card, CodeBlock, Stack } from "@hackcove/ui";
import { Prose } from "./Prose.js";
import { findStory } from "./stories.js";

/**
 * A real story rendered, with its source under it. The story is the one Storybook shows and
 * PixelSlash screenshots, so the example cannot drift from the component. An unknown `of` fails the
 * build. The preview is server-rendered HTML: it is not interactive.
 */
export function Example({ of }: { of: string }) {
  const story = findStory(of);
  if (story === undefined) throw new Error(`<Example of="${of}">: no such story with a render`);
  const { Story, code, caption } = story;
  return (
    <Stack gap="sm">
      <Card as="div">
        <Story />
      </Card>
      <CodeBlock label="tsx">{code}</CodeBlock>
      {caption && (
        <Body as="p" color="tertiary">
          <Prose text={caption} />
        </Body>
      )}
    </Stack>
  );
}
