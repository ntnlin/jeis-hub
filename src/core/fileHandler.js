/**
 * File upload handler - detects type, converts, stores, indexes
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { createHash } from 'crypto';
import path from 'path';

const INDEX_PATH = './files/index.json';

export class FileHandler {
  constructor() {
    this.index = existsSync(INDEX_PATH)
      ? JSON.parse(readFileSync(INDEX_PATH, 'utf8'))
      : { files: [], hashes: {} };
  }

  detectType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const typeMap = {
      '.pdf': 'pdf', '.docx': 'docx', '.json': 'json',
      '.csv': 'csv', '.txt': 'txt', '.md': 'md',
      '.png': 'image', '.jpg': 'image', '.jpeg': 'image',
      '.gif': 'image', '.webp': 'image'
    };
    return { type: typeMap[ext] || 'unknown', ext, filePath };
  }

  suggestPath(detected) {
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '/');
    const typeToFolder = {
      pdf: `files/personal/misc/${date}/`,
      json: `data/upload/${date}/`,
      csv: `data/upload/${date}/`,
      image: `data/upload/${date}/`,
      md: `files/personal/misc/${date}/`
    };
    return typeToFolder[detected.type] || `data/upload/${date}/`;
  }

  isDuplicate(content) {
    const hash = createHash('sha256').update(content).digest('hex');
    if (this.index.hashes[hash]) return { isDup: true, hash, existingPath: this.index.hashes[hash] };
    return { isDup: false, hash };
  }

  store(content, targetPath, metadata = {}) {
    const { isDup, hash, existingPath } = this.isDuplicate(
      typeof content === 'string' ? content : JSON.stringify(content)
    );

    if (isDup) {
      return { stored: false, reason: 'duplicate', existingPath };
    }

    const dir = path.dirname(targetPath);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

    const payload = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
    writeFileSync(targetPath, payload, 'utf8');

    this.index.hashes[hash] = targetPath;
    this.index.files.push({
      path: targetPath,
      hash,
      timestamp: new Date().toISOString(),
      type: metadata.type || 'unknown',
      source: metadata.source || null,
      confidence: metadata.confidence || null,
      tags: metadata.tags || []
    });

    this.saveIndex();
    return { stored: true, path: targetPath, hash };
  }

  saveIndex() {
    writeFileSync(INDEX_PATH, JSON.stringify(this.index, null, 2));
  }
}
