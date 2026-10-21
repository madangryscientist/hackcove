import type { Preview } from "@storybook/react-vite";
import { NONE, ThemeFrame, themeNames } from "./themes";
import "./tailwind.css";

const preview: Preview = {
  parameters: { layout: "fullscreen" },
  initialGlobals: { theme: themeNames[0] ?? NONE },
  globalTypes: {
    theme: {
      description: "Theme (one per folder under themes/)",
      toolbar: {
        icon: "paintbrush",
        dynamicTitle: true,
        items: [NONE, ...themeNames].map((name) => ({ value: name, title: name })),
      },
    },
  },
  decorators: [
    (Story, context) =>
      // A story that lays out every theme itself must not sit inside the toolbar's theme scope.
      context.parameters["allThemes"] === true ? (
        <Story />
      ) : (
        <ThemeFrame theme={String(context.globals["theme"] ?? NONE)}>
          <Story />
        </ThemeFrame>
      ),
  ],
};
export default preview;
