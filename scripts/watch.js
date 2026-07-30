#!/usr/bin/env node
/**
 * Dev convenience: re-runs scripts/build.js whenever /src or /data changes.
 * Zero dependencies — uses Node's built-in fs.watch (recursive: true, which
 * Node supports on Windows and macOS; on Linux it falls back to watching
 * each directory individually below).
 *
 * Usage: npm run watch
 * Then just leave it running while you edit files in /src or /data, and
 * refresh the page served by XAMPP/Apache to see the rebuilt output.
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const WATCH_DIRS = [path.join(ROOT, 'src'), path.join(ROOT, 'data')];

let building = false;
let pending = false;

function runBuild() {
  if (building) {
    pending = true;
    return;
  }
  building = true;
  try {
    execFileSync('node', [path.join(ROOT, 'scripts', 'build.js')], { stdio: 'inherit' });
  } catch (err) {
    console.error('[watch] build failed:', err.message);
  } finally {
    building = false;
    if (pending) {
      pending = false;
      runBuild();
    }
  }
}

let debounceTimer = null;
function scheduleBuild() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(runBuild, 150);
}

console.log('[watch] Watching /src and /data for changes. Press Ctrl+C to stop.');
runBuild();

for (const dir of WATCH_DIRS) {
  if (!fs.existsSync(dir)) continue;
  try {
    fs.watch(dir, { recursive: true }, scheduleBuild);
  } catch {
    // Fallback for platforms without recursive fs.watch support: watch top-level only.
    fs.watch(dir, scheduleBuild);
  }
}
