import { liftInteractive } from "./cx.js";

/** `liftInteractive` as it appears in rendered markup, where `&` is escaped. */
export const lifted = liftInteractive.replaceAll("&", "&amp;");
