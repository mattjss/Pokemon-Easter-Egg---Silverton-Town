#!/usr/bin/env node
/**
 * Generates overworld.png (48x16) — 3 tiles: grass, path, water.
 * Run: node scripts/generate-overworld-tileset.cjs
 */
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const W = 48;
const H = 16;
const outPath = path.join(__dirname, '..', 'public', 'assets', 'tilesets', 'overworld.png');

const png = new PNG({ width: W, height: H });

const tile = (x, color) => {
  const [r, g, b] = color;
  for (let ty = 0; ty < 16; ty++) {
    for (let tx = 0; tx < 16; tx++) {
      const i = ((ty) * W + (x + tx)) * 4;
      png.data[i] = r;
      png.data[i + 1] = g;
      png.data[i + 2] = b;
      png.data[i + 3] = 255;
    }
  }
};

tile(0, [34, 139, 34]);   // grass
tile(16, [210, 180, 140]); // path
tile(32, [65, 105, 225]);  // water

fs.mkdirSync(path.dirname(outPath), { recursive: true });
png.pack()
  .pipe(fs.createWriteStream(outPath))
  .on('finish', () => console.log('Wrote', outPath));
