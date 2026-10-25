import { Stack } from "@hackcove/ui";
import { site } from "../content/site";
import { StatusCard } from "./StatusCard";

const { today, comingSoon } = site.pixelslash;

export function PixelSlashPage() {
  return (
    <Stack width="narrow" gap="lg" className="pb-16 sm:pb-24">
      <StatusCard title={today.title} status={today.status} items={today.items} />
      <StatusCard title={comingSoon.title} status={comingSoon.status} items={comingSoon.items} />
    </Stack>
  );
}
