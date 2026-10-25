import { CodeExample } from "@hackcove/ui";
import { Prose } from "./Prose.js";
import { findStory } from "./stories.js";

/**
 * A real story rendered, with its source attached under it in one frame. The story is the one
 * Storybook shows and PixelSlash screenshots, so the example cannot drift from the component. An
 * unknown `of` fails the build. The preview is server-rendered HTML and `inert`: it is a picture, so
 * it takes no focus and no click. The story's caption, if it has one, is the frame's last band.
 */
export function Example({ of }: { of: string }) {
  const story = findStory(of);
  if (story === undefined) throw new Error(`<Example of="${of}">: no such story with a render`);
  const { Story, code, caption } = story;
  return (
    <CodeExample code={code} caption={caption ? <Prose text={caption} /> : undefined}>
      <div inert>
        <Story />
      </div>
    </CodeExample>
  );
}
