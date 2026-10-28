const rows = [
  ["Rent", "R 9 500"],
  ["Groceries", "R 4 200"],
  ["Transport", "R 1 850"],
];

/** A plain three-row table, to show what a flush Card body holds. */
export function SampleTable() {
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
