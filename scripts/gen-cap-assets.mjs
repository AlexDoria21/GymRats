import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { markSvgBody } from './mark.mjs';

// Source images for @capacitor/assets (Android launcher icons + splash),
// built from the Gym Rats dumbbell vector mark.

const INK = '#0d0d0f';

mkdirSync('assets', { recursive: true });

// Dark canvas with the centered mark scaled to `inner` of the frame.
const canvas = (size, inner) => {
  const pad = (1 - inner) / 2;
  const t = 512 * pad;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="${INK}"/>
  <g transform="translate(${t} ${t}) scale(${inner})">
    ${markSvgBody()}
  </g>
</svg>`;
};

async function render(svg, size, out) {
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(out);
}

async function run() {
  // Full-bleed launcher icon (mark inside the ~66% adaptive safe zone).
  await render(canvas(512, 0.6), 1024, 'assets/icon.png');
  // Splash: small centered mark on a large dark canvas.
  await render(canvas(512, 0.22), 2732, 'assets/splash.png');
  await render(canvas(512, 0.22), 2732, 'assets/splash-dark.png');
  console.log('capacitor source assets generated in assets/');
}
run();
