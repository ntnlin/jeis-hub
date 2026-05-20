/**
 * Outreach Tracker - Unified tracking for BD, partnerships, comments
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { Notifier } from '../core/notifier.js';

const notifier = new Notifier();
const TRACKER_PATH = './database/partners.json';

function load() {
  return JSON.parse(readFileSync(TRACKER_PATH, 'utf8'));
}

function save(data) {
  writeFileSync(TRACKER_PATH, JSON.stringify(data, null, 2));
}

export function trackOutreach(entry) {
  const db = load();
  const record = {
    id: `outreach_${Date.now()}`,
    ...entry,
    createdAt: new Date().toISOString(),
    status: entry.status || 'sent',
    source: entry.source || 'manual',
    confidence: entry.confidence || 80
  };
  db.outreach.push(record);
  save(db);
  return record;
}

export function updateStatus(id, status, notes = '') {
  const db = load();
  const item = db.outreach.find(e => e.id === id) || db.partnerships.find(e => e.id === id);
  if (!item) return null;

  item.status = status;
  item.updatedAt = new Date().toISOString();
  if (notes) item.notes = notes;

  if (status === 'replied') notifier.opportunity(`Outreach reply: ${item.target || item.partner}`);
  if (status === 'converted') notifier.urgent(`🎉 CONVERSION: ${item.target || item.partner} converted!`);

  save(db);
  return item;
}

export function getStats() {
  const db = load();
  const o = db.outreach;
  return {
    totalOutreach: o.length,
    sent: o.filter(e => e.status === 'sent').length,
    opened: o.filter(e => e.status === 'opened').length,
    replied: o.filter(e => e.status === 'replied').length,
    converted: o.filter(e => e.status === 'converted').length,
    totalPartnerships: db.partnerships.length,
    activePartnerships: db.partnerships.filter(e => e.status === 'active').length
  };
}

export function learnWhatWorked() {
  const db = load();
  const converted = db.outreach.filter(e => e.status === 'converted');
  const patterns = converted.map(e => ({
    channel: e.channel,
    project: e.project,
    messageLength: e.message?.body?.length,
    targetType: e.target
  }));
  return { convertedCount: converted.length, patterns };
}
