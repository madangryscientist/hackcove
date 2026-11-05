import type { Meta, StoryObj } from "@storybook/react-vite";
import { Image } from "@hackcove/ui-react";
import { sampleCode } from "./sampleCode";
import { sampleScenes } from "./sampleScene";

const meta: Meta = { title: "Content/Image" };
export default meta;
type S = StoryObj;

const harbour = sampleScenes[0] ?? { src: "", alt: "", caption: "" };

export const Default: S = {
  render: () => (
    <div className="max-w-md">
      <Image src={harbour.src} alt={harbour.alt} />
    </div>
  ),
};

/** `aspect` reserves the shape before the picture loads: square, 4:3, 3:2, 16:9, and the portrait 3:4 and 9:16. */
export const Aspects: S = {
  render: () => (
    <div className="grid grid-cols-3 items-end gap-4">
      {(["square", "4:3", "3:2", "16:9", "3:4", "9:16"] as const).map((aspect) => (
        <Image key={aspect} src={harbour.src} alt={`Harbour, ${aspect}`} aspect={aspect} />
      ))}
    </div>
  ),
};

/** `sm` is 96px, `md` 160px and `lg` 256px wide; `full` fills its parent. */
export const Widths: S = {
  render: () => (
    <div className="flex flex-col gap-3">
      {(["sm", "md", "lg", "full"] as const).map((width) => (
        <Image key={width} src={harbour.src} alt={`Harbour, ${width}`} width={width} />
      ))}
    </div>
  ),
};

/** `cover` fills the shape and crops; `contain` shows the whole picture inside the shape. */
export const Fits: S = {
  render: () => (
    <div className="flex items-start gap-4">
      <Image src={harbour.src} alt="Harbour, cover" aspect="square" width="md" fit="cover" />
      <Image src={harbour.src} alt="Harbour, contain" aspect="square" width="md" fit="contain" />
    </div>
  ),
};

/** With no `src`, or one that fails to load, a placeholder of the same size stands in, still named by `alt`. */
export const Missing: S = {
  render: () => (
    <div className="flex items-start gap-4">
      <Image alt="No preview yet" aspect="square" width="md" />
      <Image src="/does-not-exist.jpg" alt="Broken link" aspect="square" width="md" />
    </div>
  ),
};

/** A picture that must be seen whole, such as a QR code or a logo, is `fit="contain"`. */
export const DoFit: S = {
  render: () => <Image src={sampleCode} alt="Pairing code" aspect="3:4" width="md" fit="contain" />,
};

/** `cover` crops to the shape: it cuts the corners off a code, which then cannot be scanned. */
export const DontFit: S = {
  render: () => <Image src={sampleCode} alt="Pairing code" aspect="16:9" width="md" fit="cover" />,
};
