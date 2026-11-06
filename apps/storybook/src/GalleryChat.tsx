import { SampleChat } from "./sampleChat";

/** The chat block of the Gallery: a ChatThread of ChatMessages (one streaming) and ToolCallCards, an approval and a ChatComposer. */
export function GalleryChat() {
  return (
    <div className="max-w-xl">
      <SampleChat label="Gallery chat" />
    </div>
  );
}
