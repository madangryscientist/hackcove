import { findStory, type DocStory } from "./stories.js";

/** The two stories of a Do/Don't topic `<File>/<Topic>`: `Do<Topic>` and `Dont<Topic>`. Either may be missing. */
export function pairOf(topic: string): { do: DocStory | undefined; dont: DocStory | undefined } {
  const [stem, name] = topic.split("/");
  return {
    do: findStory(`${stem}/Do${name}`),
    dont: findStory(`${stem}/Dont${name}`),
  };
}
