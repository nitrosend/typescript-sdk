#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

// Bake the package version into the build so the client can name itself
// without reading package.json at runtime (keeps the package bundler and
// edge safe).
const __dirname = dirname(fileURLToPath(import.meta.url));
const manifestPath = resolve(__dirname, '..', 'package.json');
const outPath = resolve(__dirname, '..', 'src', 'version.generated.ts');

const { version } = JSON.parse(readFileSync(manifestPath, 'utf8'));
if (typeof version !== 'string' || !version) {
  throw new Error(`package.json has no version: ${manifestPath}`);
}

writeFileSync(outPath, [
  '// AUTO-GENERATED. Do not edit by hand.',
  '// Source: package.json',
  '// Regenerate with: npm run build',
  '',
  `export const VERSION = ${JSON.stringify(version)};`,
  '',
].join('\n'));
