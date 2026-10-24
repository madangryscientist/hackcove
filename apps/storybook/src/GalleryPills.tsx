import { Badge, IconButton, Pill, type PillTone } from "@hackcove/ui";

const tones: PillTone[] = ["slate", "amber", "emerald", "blue", "red", "violet", "sky"];

const bellIcon = (
  <svg viewBox="0 0 20 20" fill="currentColor" className="size-5">
    <path d="M10 2a5 5 0 0 0-5 5v2.6c0 .5-.2 1-.5 1.4L3.3 12.5a.75.75 0 0 0 .55 1.25h12.3a.75.75 0 0 0 .55-1.25L15.5 11a2 2 0 0 1-.5-1.4V7a5 5 0 0 0-5-5Zm-1.9 13.5a2 2 0 0 0 3.8 0H8.1Z" />
  </svg>
);

/** The Pill and Badge rows of the Gallery: the seven tones plain, with a dot and round, then red counts alone and on an icon. */
export function GalleryPills() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {tones.map((tone) => (
          <Pill key={tone} tone={tone}>
            {tone}
          </Pill>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {tones.map((tone) => (
          <Pill key={tone} tone={tone} dot>
            {tone}
          </Pill>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-6">
        <div className="flex flex-wrap gap-2">
          {tones.map((tone) => (
            <Pill key={tone} tone={tone} round>
              {tone}
            </Pill>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Badge count={3} />
          <Badge count={120} />
        </div>
        <span className="relative inline-flex">
          <IconButton label="Alerts">{bellIcon}</IconButton>
          <Badge count={3} className="absolute -right-1.5 -top-1.5" />
        </span>
      </div>
    </div>
  );
}
