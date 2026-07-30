#!/usr/bin/env node
/**
 * One-time (or one-time-per-domain-change) helper: replaces every hardcoded
 * occurrence of the placeholder domain with your real one, across /src and
 * scripts/build.js's SITE_URL constant. Run this BEFORE your first deploy,
 * and again any time the live domain changes.
 *
 * Usage:  node scripts/set-site-url.js https://www.yourdomain.com
 *
 * Why this exists: canonical URLs, Open Graph tags, and JSON-LD on the
 * hand-authored pages were written with real, literal URLs (not template
 * variables) back in Phases 9/12, since those pages aren't run through the
 * mustache engine the way products/collections are. This script is the
 * single command that fixes all of them at once instead of a risky
 * find-and-replace by hand across 15 files.
 */
const fs = require('fs');
const path = require('path');

const OLD_URL = 'https://www.yagnaarts.com';
const newUrl = process.argv[2];

if (!newUrl || !/^https?:\/\//.test(newUrl)) {
  console.error('Usage: node scripts/set-site-url.js https://www.yourdomain.com');
  process.exit(1);
}
const cleanNewUrl = newUrl.replace(/\/$/, '');

const ROOT = path.resolve(__dirname, '..');
const TARGET_DIRS = [path.join(ROOT, 'src')];
const TARGET_FILES = [path.join(ROOT, 'scripts', 'build.js')];

function walk(dir) {
  let results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results = results.concat(walk(full));
    else results.push(full);
  }
  return results;
}

let filesChanged = 0;
let occurrences = 0;

for (const file of [...TARGET_DIRS.flatMap(walk), ...TARGET_FILES]) {
  if (!/\.(html|js)$/.test(file)) continue;
  const content = fs.readFileSync(file, 'utf8');
  const matches = content.split(OLD_URL).length - 1;
  if (matches === 0) continue;
  fs.writeFileSync(file, content.split(OLD_URL).join(cleanNewUrl), 'utf8');
  filesChanged++;
  occurrences += matches;
  console.log(`Updated ${path.relative(ROOT, file)} (${matches} occurrence${matches === 1 ? '' : 's'})`);
}

console.log(`\nDone — ${occurrences} occurrence(s) across ${filesChanged} file(s) replaced.`);
console.log('Next: run `npm run build` and check `robots.txt` / `js/config.js` for anything else domain-specific.');
