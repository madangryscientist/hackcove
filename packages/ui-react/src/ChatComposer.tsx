import {
  type FormEvent,
  type KeyboardEvent,
  type ReactElement,
  useId,
  useRef,
  useState,
} from "react";
import { Button } from "./Button.js";
import { Cluster, ClusterGrow } from "./Cluster.js";
import { Field } from "./Field.js";
import type { Passthrough } from "./props.js";
import { Textarea } from "./Textarea.js";

/**
 * An IME is still composing. Safari ends the composition before the Enter's keydown, so there
 * `isComposing` is already false and only the 229 keyCode tells the commit from a real Enter.
 */
function isComposing({ nativeEvent }: KeyboardEvent<HTMLTextAreaElement>): boolean {
  return nativeEvent.isComposing || nativeEvent.keyCode === 229;
}

/**
 * The box a message is typed into, with its button beside it. It keeps its own text. Enter sends
 * the trimmed text and clears the box; Shift+Enter is a newline; empty or whitespace-only text does
 * not send. While `busy` a reply is on its way: the button is Stop, Enter does not send, and typing
 * carries on with the text kept for the next send.
 */
export function ChatComposer({
  label,
  placeholder,
  disabled = false,
  busy = false,
  onSend,
  onStop,
  sendLabel = "Send",
  stopLabel = "Stop",
  ...rest
}: {
  /** The box's name for assistive tech; it is not drawn. */
  label: string;
  /** The hint inside the empty box. */
  placeholder?: string | undefined;
  /** Disables the box and the button. For a chat that cannot take a message at all, not for a reply in flight: that is `busy`. */
  disabled?: boolean | undefined;
  /**
   * A reply is on its way: the button is Stop and Enter does not send. With no `onStop`, the button
   * stays a disabled Send and no Stop is drawn.
   */
  busy?: boolean | undefined;
  /** Called with the trimmed text. */
  onSend: (text: string) => void;
  /** Called when the reader presses Stop. */
  onStop?: (() => void) | undefined;
  /**
   * The button's word, for sending.
   * @default Send
   */
  sendLabel?: string | undefined;
  /**
   * The button's word, while `busy`.
   * @default Stop
   */
  stopLabel?: string | undefined;
} & Passthrough): ReactElement {
  const id = useId();
  const box = useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useState("");
  const trimmed = text.trim();
  const stop = busy && onStop !== undefined;

  const send = () => {
    if (busy || trimmed === "") return;
    onSend(trimmed);
    setText("");
  };
  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey || isComposing(event)) return;
    event.preventDefault();
    send();
  };
  // One submit button that is Send or Stop, so it is the same element across the swap and keeps its
  // focus. Send goes back to the box: the empty box has just disabled the button under the focus.
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) {
      onStop?.();
      return;
    }
    send();
    box.current?.focus();
  };

  return (
    <form {...rest} onSubmit={onSubmit}>
      <Cluster align="end" gap="sm">
        <ClusterGrow>
          <Field label={label} htmlFor={id} hideLabel>
            <Textarea
              ref={box}
              id={id}
              rows={2}
              value={text}
              placeholder={placeholder}
              disabled={disabled}
              onChange={(event) => setText(event.target.value)}
              onKeyDown={onKeyDown}
            />
          </Field>
        </ClusterGrow>
        <Button
          type="submit"
          variant={stop ? "outline" : "primary"}
          disabled={disabled || (busy ? !stop : trimmed === "")}
        >
          {stop ? stopLabel : sendLabel}
        </Button>
      </Cluster>
    </form>
  );
}
