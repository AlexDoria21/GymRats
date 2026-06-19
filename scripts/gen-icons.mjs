import sharp from 'sharp';
import { writeFileSync } from 'node:fs';

// "GR" monogram, full-bleed accent background (safe for maskable).
const svg = (bg, fg) => `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="96" fill="${bg}"/>
  <text x="256" y="256" fill="${fg}"
    font-family="'Helvetica Neue',Helvetica,Arial,sans-serif"
    font-size="200" font-weight="700" letter-spacing="-8"
    text-anchor="middle" dominant-baseline="central">GR</text>
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
