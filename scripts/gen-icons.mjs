// Generates the Tradies Toolbox favicon set from one master SVG.
// Orange rounded-square tile + white "crossed tools" glyph (Tabler `tools`).
// Run:  node scripts/gen-icons.mjs   (sharp is already a dependency)
import sharp from 'sharp';
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const PUBLIC = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'public');
const ORANGE = '#FF6B00';

// Tabler "tools" glyph (24x24), scaled ~11x and centred in a 512 tile, bold white stroke.
const glyph = `<g transform="translate(124 124) scale(11)" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<path d="M3 21h4l13 -13a1.5 1.5 0 0 0 -4 -4l-13 13v4" />
<path d="M14.5 5.5l4 4" />
<path d="M12 8l-5 -5l-4 4l5 5" />
<path d="M7 8l-1.5 1.5" />
<path d="M16 12l5 5l-4 4l-5 -5" />
<path d="M16 17l-1.5 1.5" />
</g>`;

const rounded = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><rect width="512" height="512" rx="115" fill="${ORANGE}"/>${glyph}</svg>`;
const square = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><rect width="512" height="512" fill="${ORANGE}"/>${glyph}</svg>`;

writeFileSync(resolve(PUBLIC, 'favicon.svg'), rounded);
await sharp(Buffer.from(rounded)).resize(32, 32).png().toFile(resolve(PUBLIC, 'favicon.png'));
await sharp(Buffer.from(square)).resize(180, 180).png().toFile(resolve(PUBLIC, 'apple-touch-icon.png'));
await sharp(Buffer.from(square)).resize(512, 512).png().toFile(resolve(PUBLIC, 'icon-512.png'));
console.log('Wrote favicon.svg, favicon.png (32), apple-touch-icon.png (180), icon-512.png to public/');
