import { addons } from "storybook/manager-api";
import { themes } from "storybook/theming";

// The manager chrome only (the corner title); `themes.normal` keeps the frame following the OS
// colour scheme. Stories and their captures are unchanged.
addons.setConfig({ theme: { ...themes.normal, brandTitle: "UISlash" } });
