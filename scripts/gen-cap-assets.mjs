import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

// Source images for @capacitor/assets (Android launcher icons + splash).
// Reuses the "GR" monogram from the PWA icons.

const ACCENT = '#3d9bff';
const INK = '#0d0d0f';

mkdirSync('assets', { recursive: true });

// Full-bleed icon (accent background + centered GR). Used for legacy + adaptive.
const icon = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <rect width="1024" height="1024" fill="${ACCENT}"/>
  <text x="512" y="512" fill="${INK}"
    font-family="'Helvetica Neue',Helvetica,Arial,sans-serif"
    font-size="420" font-weight="700" letter-spacing="-16"
    text-anchor="middle" dominant-baseline="central">GR</text>
</svg>`;

// Splash: dark background with a smaller centered GR mark.
const splash = `<svg xmlns="http://www.w3.org/2000/svg" width="2732" height="2732" viewBox="0 0 2732 2732">
  <rect width="2732" height="2732" fill="${INK}"/>
  <rect x="1146" y="1146" width="440" height="440" rx="96" fill="${ACCENT}"/>
  <text x="1366" y="1366" fill="${INK}"
    font-family="'Helvetica Neue',Helvetica,Arial,sans-serif"
    font-size="200" font-weight="700" letter-spacing="-8"
    text-anchor="middle" dominant-baseline="central">GR</text>
</svg>`;

async function run() {
  await sharp(Buffer.from(icon)).resize(1024, 1024).png().toFile('assets/icon.png');
  await sharp(Buffer.from(splash)).resize(2732, 2732).png().toFile('assets/splash.png');
  await sharp(Buffer.from(splash)).resize(2732, 2732).png().toFile('assets/splash-dark.png');
  console.log('capacitor source assets generated in assets/');
}
run();
