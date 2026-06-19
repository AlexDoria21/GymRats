// Gym Rats brand mark: a flat two-tone dumbbell, recreated as clean vector art
// (the AI-generated PNG had a baked-in checkerboard and no real transparency).
// Returns the inner SVG markup on a 512×512 canvas, horizontally centered,
// with a transparent background so callers can place it on any backdrop.

const BLUE = '#3d9bff'; // accent — matches the app
const BLUE_LIGHT = '#6fb6ff'; // outer highlight on each plate
const GRAY = '#9aa0ab'; // cool-gray accent band

const CY = 256; // vertical centre

// Plates per side, listed from the bar outward: [leftX, width, height].
const PLATES = [
  [170, 34, 188], // inner (tallest)
  [132, 36, 134], // outer
  [110, 20, 86], // end cap
];

const rrect = (x, y, w, h, r, fill) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"/>`;

function plate(x, w, h) {
  const y = CY - h / 2;
  const r = Math.min(16, w / 2);
  return [
    rrect(x, y, w, h, r, BLUE),
    // outer-edge highlight (left ~38% of the plate)
    rrect(x, y, Math.round(w * 0.38), h, r, BLUE_LIGHT),
    // gray grip band across the lower third
    rrect(x, CY + h * 0.16, w, Math.round(h * 0.2), Math.min(8, w / 3), GRAY),
  ].join('');
}

export function markSvgBody() {
  const parts = [];
  // Bar (handle) through the middle.
  const barW = 120;
  const barH = 30;
  const barX = (512 - barW) / 2;
  const barY = CY - barH / 2;
  parts.push(rrect(barX, barY, barW, barH, 15, BLUE));
  parts.push(rrect(barX, barY, barW, barH / 2, 15, BLUE_LIGHT)); // top highlight
  parts.push(rrect(256 - 12, barY, 24, barH, 6, GRAY)); // center band

  // Plates, left side then mirrored to the right across x=256.
  for (const [x, w, h] of PLATES) {
    parts.push(plate(x, w, h)); // left
    parts.push(plate(512 - x - w, w, h)); // right (mirror)
  }
  return parts.join('\n  ');
}

/** Full standalone SVG document (used for favicon.svg and rasterizing). */
export function markSvg(size = 512, bg = 'none', rx = 0) {
  const back =
    bg === 'none' ? '' : `<rect width="${size}" height="${size}" rx="${rx}" fill="${bg}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  ${back}
  ${markSvgBody()}
</svg>`;
}
