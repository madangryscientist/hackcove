import {
  Button,
  ButtonGroup,
  Callout,
  ChatComposer,
  ChatMessage,
  ChatThread,
  CodeBlock,
  Markdown,
  Stack,
  ToolCallCard,
} from "@hackcove/ui-react";

const noop = () => undefined;

/**
 * A whole chat, for the composed story and the Gallery: a question, a reply, two tool calls, an
 * approval built from a Callout and Buttons, a reply still streaming, and the composer under it.
 */
export function SampleChat({ label }: { label: string }) {
  return (
    <Stack gap="sm">
      <ChatThread label={label} height="lg" announce="Helper is checking the pantry">
        <ChatMessage role="user" author="Ada" meta="Ada, 18:02">
          What can I cook with leeks and potatoes?
        </ChatMessage>
        <ChatMessage role="assistant" author="Helper" meta="Helper, 18:02">
          <Markdown md={"## Two ideas\n- **Leek and potato soup**\n- A gratin"} />
        </ChatMessage>
        <ToolCallCard name="search_recipes" status="done" summary="Found 3 soups under an hour">
          <CodeBlock language="json">{'{ "query": "leek potato soup" }'}</CodeBlock>
        </ToolCallCard>
        <ToolCallCard name="read_pantry" status="running" summary="Checking the cupboard">
          <CodeBlock language="json">{'{ "shelf": "all" }'}</CodeBlock>
        </ToolCallCard>
        <Callout
          tone="warn"
          title="Add cream to the shopping list?"
          actions={
            <ButtonGroup>
              <Button size="sm" variant="outline" tone="danger">
                Decline
              </Button>
              <Button size="sm" tone="positive">
                Approve
              </Button>
            </ButtonGroup>
          }
        >
          The soup needs 100ml and the pantry has none.
        </Callout>
        <ChatMessage role="assistant" author="Helper" streaming>
          Start by sweating the leeks in butter
        </ChatMessage>
      </ChatThread>
      <ChatComposer label="Message" placeholder="Ask a question" busy onSend={noop} onStop={noop} />
    </Stack>
  );
}
