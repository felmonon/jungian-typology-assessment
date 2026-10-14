#!/usr/bin/env node
// Renders TypeJung's PNG icons and social preview from the identity SVGs.
// Run after brand/build-identity.py: node brand/render-rasters.mjs
// Uses the puppeteer dev dependency (set PUPPETEER_EXECUTABLE_PATH to use a
// different Chromium).
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import puppeteer from 'puppeteer';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pub = (file) => path.join(root, 'public', file);

const RASTERS = [
  { from: 'brand/typejung-favicon.svg', to: 'favicon-16x16.png', width: 16, height: 16, transparent: true },
  { from: 'brand/typejung-favicon.svg', to: 'favicon-32x32.png', width: 32, height: 32, transparent: true },
  { from: 'brand/typejung-app-icon.svg', to: 'apple-touch-icon.png', width: 180, height: 180 },
  { from: 'logo.svg', to: 'logo.png', width: 512, height: 512, transparent: true },
  { from: 'og-image.svg', to: 'og-image.png', width: 1200, height: 630 },
];

// Same launch flags as scripts/prerender.mjs, so it also runs in CI containers.
const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
try {
  const page = await browser.newPage();
  for (const { from, to, width, height, transparent = false } of RASTERS) {
    const svg = await readFile(pub(from));
    const src = `data:image/svg+xml;base64,${svg.toString('base64')}`;
    await page.setViewport({ width, height, deviceScaleFactor: 1 });
    await page.setContent(
      `<html><body style="margin:0;background:${transparent ? 'transparent' : '#fff'}">` +
        `<img src="${src}" width="${width}" height="${height}" style="display:block"></body></html>`,
      { waitUntil: 'load' },
    );
    await page.screenshot({ path: pub(to), omitBackground: transparent, clip: { x: 0, y: 0, width, height } });
    console.log(`${from} -> public/${to} (${width}x${height})`);
  }
} finally {
  await browser.close();
}
