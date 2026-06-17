import sharp from 'sharp';
import { writeFileSync } from 'node:fs';

// Dumbbell mark, full-bleed accent background (safe for maskable).
const svg = (bg, fg) => `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="96" fill="${bg}"/>
  <g fill="${fg}">
    <rect x="156" y="236" width="200" height="40" rx="10"/>
    <rect x="120" y="186" width="40" height="140" rx="14"/>
    <rect x="80"  y="206" width="38" height="100" rx="14"/>
    <rect x="352" y="186" width="40" height="140" rx="14"/>
    <rect x="394" y="206" width="38" height="100" rx="14"/>
  </g>
</svg>`;

const ACCENT = '#3d9bff';
const INK = '#0d0d0f';

const main = svg(ACCENT, INK);

async function run() {
  await sharp(Buffer.from(main)).resize(192, 192).png().toFile('public/pwa-192x192.png');
  await sharp(Buffer.from(main)).resize(512, 512).png().toFile('public/pwa-512x512.png');
  // maskable = same full-bleed mark
  await sharp(Buffer.from(main)).resize(512, 512).png().toFile('public/maskable-512x512.png');
  await sharp(Buffer.from(main)).resize(180, 180).png().toFile('public/apple-touch-icon.png');
  writeFileSync('public/favicon.svg', main);
  console.log('icons generated');
}
run();
