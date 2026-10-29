/** Stand-in landscape photos for stories, 3:2: inline SVGs, so no story depends on a file or the network. */
const scene = (sky: string, sun: string, hills: string, water: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200"><rect width="300" height="200" fill="${sky}"/><circle cx="210" cy="70" r="26" fill="${sun}"/><path d="M0 130 70 80l50 34 60-48 120 64v70H0z" fill="${hills}"/><rect y="150" width="300" height="50" fill="${water}"/></svg>`,
  )}`;

export const sampleScenes = [
  {
    src: scene("#fdba74", "#fef3c7", "#7c2d12", "#1e3a8a"),
    alt: "Harbour at dusk",
    caption: "Harbour at dusk, from the north pier.",
  },
  {
    src: scene("#bae6fd", "#fefce8", "#166534", "#0369a1"),
    alt: "Hills over the bay",
    caption: "The hills over the bay at noon.",
  },
  {
    src: scene("#312e81", "#e0e7ff", "#1e1b4b", "#172554"),
    alt: "The bay by moonlight",
    caption: "The bay by moonlight.",
  },
];
