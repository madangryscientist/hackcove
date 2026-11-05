/** A stand-in QR code: an inline SVG, square, with its finder squares at the very edge, so cropping it shows. */
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#fff"/><path d="M0 0h28v28H0zM72 0h28v28H72zM0 72h28v28H0zM44 8h8v8h-8zM44 24h16v8H44zM8 44h8v8H8zM24 44h24v8H24zM60 44h8v16h-8zM76 44h16v8H76zM44 60h8v32h-8zM60 76h32v8H60z" fill="#111"/></svg>`;
export const sampleCode = `data:image/svg+xml,${encodeURIComponent(svg)}`;
