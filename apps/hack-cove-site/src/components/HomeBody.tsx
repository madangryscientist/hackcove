import { Prose, Stack } from "@hackcove/ui-react";
import { Projects } from "./Projects";
import { SectionCards } from "./SectionCards";

/**
 * The home page under the hero: a reading page, so it sits on the long-form scale. It is one React
 * tree, because `Prose` reaches only the components rendered inside it, and Astro renders each
 * component it is given on its own.
 */
export function HomeBody() {
  return (
    <Prose>
      <Stack gap="xl">
        <SectionCards />
        <Projects />
      </Stack>
    </Prose>
  );
}
