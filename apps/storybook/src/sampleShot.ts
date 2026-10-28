/** A stand-in screenshot for stories, 320×200: an inline SVG, so no story depends on a file or the network. */
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200"><rect width="320" height="200" fill="#f1f5f9"/><rect width="320" height="28" fill="#cbd5e1"/><rect x="16" y="44" width="180" height="14" rx="3" fill="#94a3b8"/><rect x="16" y="68" width="288" height="8" rx="2" fill="#cbd5e1"/><rect x="16" y="84" width="260" height="8" rx="2" fill="#cbd5e1"/><rect x="16" y="112" width="136" height="72" rx="6" fill="#e2e8f0"/><rect x="168" y="112" width="136" height="72" rx="6" fill="#e2e8f0"/><rect x="232" y="8" width="72" height="12" rx="3" fill="#94a3b8"/></svg>`;

export const sampleShot = `data:image/svg+xml,${encodeURIComponent(svg)}`;

/** The stand-in screenshot's own size, the units an `OutlineRegion`'s `rect` is in. */
export const sampleShotSize = { width: 320, height: 200 };
