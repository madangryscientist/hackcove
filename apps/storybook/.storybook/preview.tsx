import type { Preview } from "@storybook/react-vite";
import { ThemeFrame, themeNames } from "./themes";
import "./tailwind.css";

const preview: Preview = {
  parameters: {
    layout: "fullscreen",
    // The three widths the Layout stories and the no-jump e2e are checked at.
    viewport: {
      options: {
        phone: { name: "Phone (375)", styles: { width: "375px", height: "812px" }, type: "mobile" },
        tablet: {
          name: "Tablet (768)",
          styles: { width: "768px", height: "1024px" },
          type: "tablet",
        },
        desktop: {
          name: "Desktop (1280)",
          styles: { width: "1280px", height: "800px" },
          type: "desktop",
        },
      },
    },
  },
  initialGlobals: { theme: themeNames[0] },
  globalTypes: {
    theme: {
      description: "Theme (one per folder under themes/)",
      toolbar: {
        icon: "paintbrush",
        dynamicTitle: true,
        items: themeNames.map((name) => ({ value: name, title: name })),
      },
    },
  },
  decorators: [
    (Story, context) =>
      // A story that lays out every theme itself must not sit inside the toolbar's theme scope.
      context.parameters["allThemes"] === true ? (
        <Story />
      ) : (
        <ThemeFrame
          theme={String(context.globals["theme"] ?? themeNames[0])}
          bare={context.parameters["bare"] === true}
        >
          <Story />
        </ThemeFrame>
      ),
  ],
};
export default preview;
