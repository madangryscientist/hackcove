import type { Preview } from "@storybook/react-vite";
import { ThemeDocument, themeNames } from "./themes";
import "./tailwind.css";

const preview: Preview = {
  parameters: {
    // A story is cropped to its component by default; a page or layout opts in to "fullscreen".
    layout: "centered",
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
    (Story, context) => (
      <ThemeDocument
        // A story that lays out every theme itself must not sit inside the toolbar's theme scope.
        theme={
          context.parameters["allThemes"] === true
            ? undefined
            : String(context.globals["theme"] ?? themeNames[0])
        }
        padded={
          context.parameters["layout"] === "fullscreen" && context.parameters["bare"] !== true
        }
      >
        <Story />
      </ThemeDocument>
    ),
  ],
};
export default preview;
