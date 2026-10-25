/** Writes `src/generated/props.json`. Run by the `props` Nx target before build, typecheck, lint and test. */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { generateProps, PROPS_JSON } from "./generate-props.js";

mkdirSync(dirname(PROPS_JSON), { recursive: true });
writeFileSync(PROPS_JSON, `${JSON.stringify(generateProps(), null, 2)}\n`);
