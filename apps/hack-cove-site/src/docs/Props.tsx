import {
  Body,
  Stack,
  SubsectionHeading,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@hackcove/ui";
import propsJson from "../generated/props.json";
import { Prose } from "./Prose.js";
import type { ComponentDoc, PropsJson } from "./types.js";

const all: PropsJson = propsJson;

/** The doc of one component, from `src/generated/props.json`; an unknown name fails the build. */
export function docOf(name: string): ComponentDoc {
  const doc = all[name];
  if (doc === undefined) throw new Error(`<Props of="${name}">: not in props.json`);
  return doc;
}

/** One component's props, read from its types and JSDoc in `packages/ui`. */
export function Props({ of }: { of: string }) {
  const { name, description, props } = docOf(of);
  return (
    <Stack gap="sm">
      <SubsectionHeading>{name}</SubsectionHeading>
      {description && (
        <Body as="p">
          <Prose text={description.replace(/\s*\n\s*/g, " ")} />
        </Body>
      )}
      {props.length > 0 && (
        <Table caption={`${name} props`}>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Prop</TableHeaderCell>
              <TableHeaderCell>Type</TableHeaderCell>
              <TableHeaderCell>Default</TableHeaderCell>
              <TableHeaderCell>Description</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {props.map((prop) => (
              <TableRow key={prop.name}>
                <TableCell mono tone="strong">
                  {prop.name}
                  {prop.required && " *"}
                </TableCell>
                <TableCell mono>{prop.type}</TableCell>
                <TableCell mono tone="muted">
                  {prop.default ?? "—"}
                </TableCell>
                <TableCell>
                  <Prose text={prop.description} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Stack>
  );
}
