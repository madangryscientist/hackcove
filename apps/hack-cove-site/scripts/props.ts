/** Writes `src/generated/props.json` and `types.json`. Run by the `props` moon task before build, typecheck, lint and test. */
import { writeProps } from "./generate-props.js";

writeProps();
