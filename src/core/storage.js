/**
 * Filesystem helpers that create the target directory before writing.
 *
 * Output paths in this project are date-based (e.g. files/projects/x/2026/06/20/),
 * so the directory rarely exists yet. Plain fs.writeFileSync throws ENOENT in that
 * case - these wrappers mkdir the parent first.
 */

import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'fs';
import path from 'path';

export function writeFileSafe(filePath, data, options) {
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, data, options);
  return filePath;
}

export function writeJsonSafe(filePath, value, options) {
  return writeFileSafe(filePath, JSON.stringify(value, null, 2), options);
}

export function readJsonSafe(filePath, fallback = null) {
  if (!existsSync(filePath)) return fallback;
  try {
    return JSON.parse(readFileSync(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}
