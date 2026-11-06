import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import {
  Cluster,
  type Size,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Text,
} from "@hackcove/ui-react";

const meta: Meta = { title: "Forms/Switch" };
export default meta;
type S = StoryObj;

/** A Switch whose value the story keeps, the way a caller would. */
function Kept({
  initial = false,
  label,
  description,
  size,
}: {
  initial?: boolean;
  label: string;
  description?: string;
  size?: Size;
}) {
  const [checked, setChecked] = useState(initial);
  return (
    <Switch
      label={label}
      description={description}
      size={size}
      checked={checked}
      onChange={setChecked}
    />
  );
}

export const Off: S = {
  render: () => <Kept label="Live in staging" />,
};
export const On: S = {
  render: () => <Kept label="Live in staging" initial />,
};

/** `sm`, `md` (the default) and `lg`, off and on: the track and the label grow together. */
export const Sizes: S = {
  render: () => (
    <div className="flex flex-col gap-3">
      {(["sm", "md", "lg"] as const).map((size) => (
        <Cluster key={size} gap="md">
          <Kept size={size} label={`Off, ${size}`} />
          <Kept size={size} label={`On, ${size}`} initial />
        </Cluster>
      ))}
    </div>
  ),
};

/** `description` is a muted line under the label that the switch is described by; the switch sits on the label's first line. */
export const WithDescription: S = {
  render: () => (
    <div className="flex w-80 flex-col gap-4">
      <Kept
        label="Live in production"
        description="Serves the flag to every request in this environment."
        initial
      />
      <Kept size="sm" label="Live in staging" description="Only the QA team sees it." />
      <Kept size="lg" label="Live in preview" description="Branch previews only." />
    </div>
  ),
};

/** `busy` is the save in flight: it keeps its colour and its focus, and a click or a key does nothing. */
export const Busy: S = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Switch label="Saving, on" checked busy onChange={() => undefined} />
      <Switch label="Saving, off" checked={false} busy onChange={() => undefined} />
    </div>
  ),
};

/** The caller's state drives the cycle: a flip goes busy for a moment, then lands. There is no server. */
export const Saving: S = {
  render: () => {
    const [checked, setChecked] = useState(false);
    const [busy, setBusy] = useState(false);
    return (
      <Switch
        label="Live in staging"
        checked={checked}
        busy={busy}
        onChange={(next) => {
          setBusy(true);
          setTimeout(() => {
            setChecked(next);
            setBusy(false);
          }, 1000);
        }}
      />
    );
  },
};

export const Disabled: S = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Switch label="Live in staging" checked={false} disabled onChange={() => undefined} />
      <Switch label="Live in production" checked disabled onChange={() => undefined} />
    </div>
  ),
};

const flags = ["checkout-v2", "dark-mode", "new-search"];

/** Bare, in a table cell: no `label`, so `aria-label` names it. */
export const Bare: S = {
  render: () => {
    const [on, setOn] = useState<Record<string, boolean>>({ "dark-mode": true });
    return (
      <Table caption="Flags">
        <TableHead>
          <TableRow>
            <TableHeaderCell>Flag</TableHeaderCell>
            <TableHeaderCell>Staging</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {flags.map((flag) => (
            <TableRow key={flag}>
              <TableCell mono>{flag}</TableCell>
              <TableCell>
                <Switch
                  size="sm"
                  aria-label={`${flag} in staging`}
                  checked={on[flag] ?? false}
                  onChange={(next) => setOn((state) => ({ ...state, [flag]: next }))}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  },
};

/** A Switch takes a `label`: the whole label is the click target, and it names the switch. */
export const DoLabel: S = {
  render: () => {
    const [checked, setChecked] = useState(true);
    return <Switch label="Live in staging" checked={checked} onChange={setChecked} />;
  },
};

/** Words beside the switch, not in it, name nothing: clicking the words does nothing. */
export const DontLabel: S = {
  render: () => {
    const [checked, setChecked] = useState(true);
    return (
      <Cluster gap="sm">
        <Switch aria-label="Live in staging" checked={checked} onChange={setChecked} />
        <Text>Live in staging</Text>
      </Cluster>
    );
  },
};

/** In a table cell there is no room for words: leave the `label` out, use `size="sm"` and name the switch with `aria-label`. */
export const DoRow: S = {
  render: () => {
    const [checked, setChecked] = useState(true);
    return (
      <Table caption="Flags">
        <TableBody>
          <TableRow>
            <TableCell mono>checkout-v2</TableCell>
            <TableCell>
              <Switch
                size="sm"
                aria-label="checkout-v2 in staging"
                checked={checked}
                onChange={setChecked}
              />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  },
};
