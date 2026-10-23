/** A stand-in portrait for stories: an inline SVG, so no story depends on a file or the network. */
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect width="96" height="96" fill="#94a3b8"/><circle cx="48" cy="38" r="17" fill="#f1f5f9"/><path d="M12 96c0-22 16-34 36-34s36 12 36 34z" fill="#f1f5f9"/></svg>`;

export const samplePhoto = `data:image/svg+xml,${encodeURIComponent(svg)}`;
