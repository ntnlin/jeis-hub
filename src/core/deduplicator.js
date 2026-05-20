/**
 * Deduplication engine - hash-check before any store operation
 */

import { createHash } from 'crypto';
import { readFileSync, writeFileSync, existsSync } from 'fs';

const HASH_DB = './database/hashes.json';

export class Deduplicator {
  constructor() {
    this.hashes = existsSync(HASH_DB)
      ? JSON.parse(readFileSync(HASH_DB, 'utf8'))
      : {};
  }

  hash(content) {
    const str = typeof content === 'string' ? content : JSON.stringify(content);
    return createHash('sha256').update(str).digest('hex');
  }

  check(content) {
    const h = this.hash(content);
    const existing = this.hashes[h];
    return { isDuplicate: !!existing, hash: h, existingRef: existing || null };
  }

  register(content, ref) {
    const h = this.hash(content);
    this.hashes[h] = { ref, registeredAt: new Date().toISOString() };
    this.save();
    return h;
  }

  save() {
    writeFileSync(HASH_DB, JSON.stringify(this.hashes, null, 2));
  }

  clean(keepRefs) {
    const before = Object.keys(this.hashes).length;
    for (const [h, val] of Object.entries(this.hashes)) {
      if (!keepRefs.includes(val.ref)) delete this.hashes[h];
    }
    this.save();
    return before - Object.keys(this.hashes).length;
  }
}
