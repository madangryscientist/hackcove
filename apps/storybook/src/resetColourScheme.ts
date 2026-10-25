/** ColourSchemeToggle switches <html>, which the toolbar's theme scope does not use. A story that shows it calls this as `beforeEach`, so the snapshot is the light state and leaving the story puts <html> and storage back. */
export function resetColourScheme(): () => void {
  const root = document.documentElement;
  const reset = () => {
    root.classList.remove("dark", "paper");
    root.style.removeProperty("color-scheme");
  };
  reset();
  return () => {
    reset();
    try {
      localStorage.removeItem("hackcove:colour-scheme");
    } catch {
      // storage blocked; nothing was stored
    }
  };
}
