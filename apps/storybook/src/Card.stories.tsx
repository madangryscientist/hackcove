import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, Card, Empty, Pill } from "@hackcove/ui";

const meta: Meta = { title: "UI/Card" };
export default meta;
type S = StoryObj;

const rows = [
  ["Rent", "R 9 500"],
  ["Groceries", "R 4 200"],
  ["Transport", "R 1 850"],
];

function Table() {
  return (
    <table className="w-full text-left text-sm">
      <tbody>
        {rows.map(([name, amount]) => (
          <tr key={name} className="border-b border-slate-200/70 last:border-b-0">
            <td className="px-5 py-2 text-slate-700">{name}</td>
            <td className="px-5 py-2 text-right tabular-nums">{amount}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export const Default: S = {
  render: () => (
    <div className="max-w-md">
      <Card title="Open" count={3}>
        <Empty>Three things to do.</Empty>
      </Card>
    </div>
  ),
};

/** `status` puts a Pill (or any node) directly beside the title; `actions` stays at the far end. */
export const Status: S = {
  render: () => (
    <div className="flex max-w-md flex-col gap-4">
      <Card title="Hack Cove UI" status={<Pill tone="emerald">Available</Pill>}>
        <Empty>Components and themes, designed together.</Empty>
      </Card>
      <Card
        bar
        title="PixelSlash"
        status={<Pill tone="amber">Coming soon</Pill>}
        actions={
          <Button size="sm" variant="outline">
            Join
          </Button>
        }
      >
        <p className="text-sm text-slate-700">Status beside the title, action at the end.</p>
      </Card>
    </div>
  ),
};

export const Flush: S = {
  render: () => (
    <div className="max-w-md">
      <Card flush>
        <Table />
      </Card>
    </div>
  ),
};

export const HeaderBar: S = {
  render: () => (
    <div className="max-w-md">
      <Card
        bar
        flush
        title="Bills"
        count={3}
        actions={
          <Button size="sm" variant="outline">
            Add
          </Button>
        }
      >
        <Table />
      </Card>
    </div>
  ),
};

export const HeaderBarPadded: S = {
  render: () => (
    <div className="max-w-md">
      <Card bar title="Notes" actions={<Button size="sm">Save</Button>}>
        <p className="text-sm text-slate-700">A padded body under the tinted strip.</p>
      </Card>
    </div>
  ),
};

export const Dashed: S = {
  render: () => (
    <div className="max-w-md">
      <Card dashed>No statements yet. Import one to get started.</Card>
    </div>
  ),
};

/** `dashed="filled"`: the dashed outline on a surface fill with more padding, for an empty state that reads as a panel. */
export const DashedFilled: S = {
  render: () => (
    <div className="max-w-md">
      <Card dashed="filled">No statements yet. Import one to get started.</Card>
    </div>
  ),
};
