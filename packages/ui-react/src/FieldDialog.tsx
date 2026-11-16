import { type FormEvent, type ReactElement, useState } from "react";
import { Button } from "./Button.js";
import { Dialog } from "./Dialog.js";
import { Field } from "./Field.js";
import { Input } from "./Input.js";
import type { Passthrough } from "./props.js";

export type FieldDialogProps = {
  /** The dialog's heading and accessible name. */
  title: string;
  /** A muted line under the title. */
  description?: string;
  /** The visible label above the field, which names it. */
  label: string;
  /** The field's placeholder. */
  placeholder: string;
  /** A muted line under the field; `emptyReason` takes its place while the field is empty. */
  hint: string;
  /** Said when the field is empty and the submit button is blocked. */
  emptyReason: string;
  /** The submit button's text. */
  submit: string;
  /** What the submit button says while `onSubmit` runs. */
  busyLabel: string;
  /** Gets the trimmed value. Resolving closes the dialog; a rejection shows its message in it. */
  onSubmit: (value: string) => Promise<unknown>;
  /** Called when the dialog closes: Cancel, Esc, the backdrop, or a resolved `onSubmit`. */
  onClose: () => void;
} & Passthrough;

/** The field's value and its in-flight state; `send` is the form's submit handler. */
function useFieldSubmit(onSubmit: (value: string) => Promise<unknown>) {
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const empty = value.trim().length === 0;
  const send = (event: FormEvent) => {
    if (empty || busy) return;
    // Close the <dialog> itself, so it animates out before `onClose` unmounts it.
    const dialog = event.currentTarget.closest("dialog");
    setError(null);
    setBusy(true);
    void onSubmit(value.trim()).then(
      () => dialog?.close(),
      (e: unknown) => {
        setBusy(false);
        setError(e instanceof Error ? e.message : String(e));
      },
    );
  };
  return { value, setValue, busy, error, empty, send };
}

/** A `Dialog` with one text field and Cancel / submit buttons. Render it only while open. */
export function FieldDialog({
  title,
  description,
  label,
  placeholder,
  hint,
  emptyReason,
  submit,
  busyLabel,
  onSubmit,
  onClose,
  ...rest
}: FieldDialogProps): ReactElement {
  const { value, setValue, busy, error, empty, send } = useFieldSubmit(onSubmit);

  return (
    <Dialog
      {...rest}
      title={title}
      description={description}
      onClose={onClose}
      onSubmit={send}
      footer={
        <>
          <Button
            variant="ghost"
            onClick={(event) => event.currentTarget.closest("dialog")?.close()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabledReason={empty ? emptyReason : undefined}
            busy={busy && (busyLabel || true)}
          >
            {submit}
          </Button>
        </>
      }
    >
      <Field label={label} hint={empty ? emptyReason : hint} error={error ?? undefined}>
        <Input
          autoFocus
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoComplete="off"
        />
      </Field>
    </Dialog>
  );
}
