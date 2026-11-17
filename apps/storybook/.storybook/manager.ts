import { addons } from "storybook/manager-api";
import { create } from "storybook/theming";

// The manager chrome only (the corner title); stories and their captures are unchanged.
addons.setConfig({ theme: create({ base: "light", brandTitle: "UISlash" }) });
