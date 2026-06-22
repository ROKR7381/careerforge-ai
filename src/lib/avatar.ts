/**
 * Generates a premium SVG avatar data URL from a name.
 * Creates a gradient circle with centered initials.
 * Browser-compatible (no Buffer dependency).
 */
export function generateAvatarDataUrl(name: string): string {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");

  const svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">',
    "  <defs>",
    '    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">',
    '      <stop offset="0%" stop-color="#4f46e5"/>',
    '      <stop offset="100%" stop-color="#7c3aed"/>',
    "    </linearGradient>",
    "  </defs>",
    '  <circle cx="100" cy="100" r="100" fill="url(#bg)"/>',
    '  <text x="100" y="100" text-anchor="middle" dominant-baseline="central"',
    '    font-family="Inter, Helvetica, Arial, sans-serif"',
    '    font-size="64" font-weight="700" fill="white" letter-spacing="2">',
    `    ${initials}`,
    "  </text>",
    "</svg>",
  ].join("\n");

  const encoded = encodeURIComponent(svg);
  return `data:image/svg+xml,${encoded}`;
}

export const sampleAvatarDataUrl = generateAvatarDataUrl("Roshan Kumar");
