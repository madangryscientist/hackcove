import { CodeExample } from "@hackcove/ui-react";
import { InlineCode } from "./InlineCode.js";
import { findStory } from "./stories.js";

/**
 * A real story rendered, with its source attached under it in one frame. The story is the one
 * Storybook shows and PixelSlash screenshots, so the example cannot drift from the component. An
 * unknown `of` fails the build. The preview is server-rendered HTML and `inert`: it is a picture, so
 * it takes no focus and no click. The story's caption, if it has one, is the frame's last band.
 * `copy` adds the copy button to the source; the page body is never hydrated, so it works through
 * `copyScript` in the layout. A Don't example leaves it off: copying the wrong way invites it.
 */
export function Example({ of, copy = false }: { of: string; copy?: boolean }) {
  const story = findStory(of);
  if (story === undefined) throw new Error(`<Example of="${of}">: no such story with a render`);
  const { Story, code, caption } = story;
  return (
    <CodeExample
      code={code}
      copy={copy}
      caption={caption ? <InlineCode text={caption} /> : undefined}
    >
      <div inert>
        <Story />
      </div>
    </CodeExample>
  );
}
