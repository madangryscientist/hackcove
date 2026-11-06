import { type ReactNode, useId } from "react";

/** The label, with its muted description under it when there is one. */
export function Words({
  label,
  description,
  id,
}: {
  label: ReactNode;
  description: ReactNode;
  id: string | undefined;
}): ReactNode {
  if (id === undefined) return label;
  return (
    <span className="flex flex-col gap-0.5">
      <span>{label}</span>
      <span id={id} className="text-xs text-slate-500">
        {description}
      </span>
    </span>
  );
}

/** The description's id (none without a description) and the control's whole `aria-describedby`. */
export function useDescription(description: ReactNode, describedBy: string | undefined) {
  const generatedId = useId();
  const descriptionId = description != null && description !== false ? generatedId : undefined;
  return { descriptionId, describedIds: [describedBy, descriptionId].filter(Boolean).join(" ") };
}
