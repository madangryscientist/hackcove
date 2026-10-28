import {
  Caption,
  Code,
  Divider,
  KeyValue,
  KeyValueList,
  Stack,
  SubsectionHeading,
  Text,
} from "@hackcove/ui";
import propsJson from "../generated/props.json";
import { Prose } from "./Prose.js";
import type { ComponentDoc, PropDoc, PropsJson } from "./types.js";

const all: PropsJson = propsJson;

/** The doc of one component, from `src/generated/props.json`; an unknown name fails the build. */
export function docOf(name: string): ComponentDoc {
  const doc = all[name];
  if (doc === undefined) throw new Error(`<Props of="${name}">: not in props.json`);
  return doc;
}

/** One prop: its name, what it does, then its type and default. Stacked, so it reads at any width. */
function PropEntry({ prop }: { prop: PropDoc }) {
  return (
    <Stack gap="xs">
      <div>
        <Text strong>
          <Code>{prop.name}</Code>
        </Text>
        {prop.required && <Caption> required</Caption>}
      </div>
      {prop.description && (
        <Text as="p">
          <Prose text={prop.description} />
        </Text>
      )}
      <KeyValueList align="start">
        <KeyValue label="Type">
          <Code>{prop.type}</Code>
        </KeyValue>
        {prop.default !== undefined && (
          <KeyValue label="Default">
            <Code>{prop.default}</Code>
          </KeyValue>
        )}
      </KeyValueList>
    </Stack>
  );
}

/** One component's props, read from its types and JSDoc in `packages/ui`. */
export function Props({ of }: { of: string }) {
  const { name, description, props } = docOf(of);
  return (
    <Stack gap="sm">
      <SubsectionHeading>{name}</SubsectionHeading>
      {description && (
        <Text as="p">
          <Prose text={description.replace(/\s*\n\s*/g, " ")} />
        </Text>
      )}
      {props.map((prop) => (
        <Stack key={prop.name} gap="sm">
          <Divider />
          <PropEntry prop={prop} />
        </Stack>
      ))}
    </Stack>
  );
}
