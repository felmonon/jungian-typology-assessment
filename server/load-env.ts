import { existsSync } from 'fs';
import { resolve } from 'path';
import { config } from 'dotenv';

const mode = process.env.NODE_ENV;
const candidates = [
  mode ? `.env.${mode}.local` : null,
  '.env.local',
  mode ? `.env.${mode}` : null,
  '.env',
].filter(Boolean) as string[];

for (const file of candidates) {
  const path = resolve(process.cwd(), file);
  if (existsSync(path)) {
    config({ path, override: false });
  }
}
