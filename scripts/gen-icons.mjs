import sharp from 'sharp';
import { writeFileSync } from 'node:fs';
import { markSvg, markSvgBody } from './mark.mjs';

// App icons (PWA + favicon) built from the Gym Rats dumbbell vector mark.
// The mark sits on a dark rounded background that matches the app theme.

const INK = '#0d0d0f';

// Dark rounded background (subtle top-down gradient) with the centered mark,
// scaled to `inner` of the canvas. `rx` ~0.1875 keeps the brand corner radius.
const composed = (inner, rounded = true) => {
  const pad = (1 - inner) / 2;
  const tx = 512 * pad;
  const scale = inner;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#1b1b1e"/><stop offset="1" stop-color="${INK}"/>
  </linearGradient></defs>
  <rect width="512" height="512" rx="${rounded ? 96 : 0}" fill="url(#g)"/>
  <g transform="translate(${tx} ${tx}) scale(${scale})">
    ${markSvgBody()}
  </g>
</svg>`;
};

async function render(svg, size, out) {
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(out);
}

async function run() {
  await render(composed(0.78), 192, 'public/pwa-192x192.png');
  await render(composed(0.78), 512, 'public/pwa-512x512.png');
  await render(composed(0.82), 180, 'public/apple-touch-icon.png');
  // Maskable: full-bleed, mark inside the ~66% safe zone.
  await render(composed(0.62, false), 512, 'public/maskable-512x512.png');
  // Favicon as a true vector + a PNG fallback.
  writeFileSync('public/favicon.svg', markSvg(512, INK, 96));
  await render(composed(0.86), 64, 'public/favicon.png');
  console.log('icons generated from vector mark');
}
run();
