import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, Card, Empty } from "@hackcove/ui";

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
