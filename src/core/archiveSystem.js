/**
 * Archive and rollback system for stored files
 */

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, mkdirSync, copyFileSync } from 'fs';
import path from 'path';
import { createHash } from 'crypto';
import { Notifier } from './notifier.js';

const notifier = new Notifier();
const ARCHIVE_ROOT = './archive';
const HISTORY_PATH = './database/edit-history.json';

function loadHistory() {
  return existsSync(HISTORY_PATH) ? JSON.parse(readFileSync(HISTORY_PATH, 'utf8')) : { edits: [] };
}

export function archiveFile(filePath) {
  const content = readFileSync(filePath, 'utf8');
  const date = new Date().toISOString().split('T')[0];
  const archivePath = `${ARCHIVE_ROOT}/${date}/${path.basename(filePath)}-${Date.now()}`;

  mkdirSync(path.dirname(archivePath), { recursive: true });
  writeFileSync(archivePath, content);

  const history = loadHistory();
  history.edits.push({
    originalPath: filePath,
    archivePath,
    hash: createHash('sha256').update(content).digest('hex'),
    archivedAt: new Date().toISOString()
  });
  writeFileSync(HISTORY_PATH, JSON.stringify(history, null, 2));
  return archivePath;
}

export function rollback(filePath, version = -1) {
  const history = loadHistory();
  const fileEdits = history.edits.filter(e => e.originalPath === filePath);

  if (fileEdits.length === 0) return { error: 'no_history', filePath };

  const target = fileEdits.at(version);
  if (!target || !existsSync(target.archivePath)) return { error: 'version_not_found' };

  archiveFile(filePath);
  copyFileSync(target.archivePath, filePath);
  notifier.alert('REMINDER', `Rolled back ${path.basename(filePath)} to ${target.archivedAt}`);
  return { rolledBack: true, filePath, restoredFrom: target.archivePath };
}

export function getEditHistory(filePath) {
  const history = loadHistory();
  return history.edits.filter(e => e.originalPath === filePath).reverse();
}

export function archiveOldData(daysOld = 30) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysOld);
  let archived = 0;

  const walkAndArchive = (dir) => {
    if (!existsSync(dir)) return;
    readdirSync(dir).forEach(file => {
      const full = path.join(dir, file);
      const stat = statSync(full);
      if (stat.isDirectory()) { walkAndArchive(full); return; }
      if (stat.mtime < cutoff && full.endsWith('.json')) {
        archiveFile(full);
        archived++;
      }
    });
  };

  walkAndArchive('./files');
  notifier.alert('REMINDER', `Archived ${archived} files older than ${daysOld} days`);
  return { archived };
}
