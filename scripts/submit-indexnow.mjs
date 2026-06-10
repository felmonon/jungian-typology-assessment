#!/usr/bin/env node
// Submits every sitemap URL to IndexNow (Bing, Yandex, Seznam, Naver).
// The key file public/<key>.txt must be deployed before running this.

import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const HOST = 'typejung.com';
const KEY = '5b691ede5e059ccbc8ff9da280a6a1b8';

const sitemap = readFileSync(join(__dirname, '../public/sitemap.xml'), 'utf8');
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

if (urls.length === 0) {
  console.error('No URLs found in sitemap.xml');
  process.exit(1);
}

const keyFileUrl = `https://${HOST}/${KEY}.txt`;
const keyCheck = await fetch(keyFileUrl);
if (!keyCheck.ok || (await keyCheck.text()).trim() !== KEY) {
  console.error(`Key file not live at ${keyFileUrl} — deploy first.`);
  process.exit(1);
}

const response = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({
    host: HOST,
    key: KEY,
    keyLocation: keyFileUrl,
    urlList: urls,
  }),
});

console.log(`Submitted ${urls.length} URLs to IndexNow: HTTP ${response.status}`);
if (!response.ok && response.status !== 202) {
  console.error(await response.text());
  process.exit(1);
}
