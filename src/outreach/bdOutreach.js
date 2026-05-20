/**
 * Section 6C - BD Outreach Automation
 * Research target → identify synergy → write short+specific message → track
 */

import { writeFileSync, readFileSync, existsSync } from 'fs';
import { callClaude } from '../core/claudeAPI.js';
import { Notifier } from '../core/notifier.js';

const notifier = new Notifier();
const TODAY = new Date().toISOString().split('T')[0].replace(/-/g, '/');
const LOG_PATH = `./files/outreach/bd/${TODAY}/outreach-log.json`;

function loadLog() {
  return existsSync(LOG_PATH) ? JSON.parse(readFileSync(LOG_PATH, 'utf8')) : [];
}

export async function generateOutreach(target, projectContext, channel = 'dm') {
  const { text: research } = await callClaude({
    system: `Research ${target.name || target.handle}. Based on what you know, identify: what they do, their current focus, why they might care about a Web3 project partnership. Output JSON: { targetSummary, currentFocus, potentialSynergy, approachAngle }.`,
    messages: [{ role: 'user', content: JSON.stringify(target) }],
    maxTokens: 512
  });

  const researchData = JSON.parse(research);

  const { text: message } = await callClaude({
    system: `Write a BD outreach message from Jei (@jeivyou) to ${target.handle || target.name}. Rules:\n- Short (2-3 sentences max)\n- Specific (reference their actual work)\n- No generic praise ("love your work", "huge fan")\n- No boring subject lines\n- Identify specific synergy point\n- State specific ask\n- Never shill without context\nOutput JSON: { subject, body, tone: "formal" }.`,
    messages: [{ role: 'user', content: `Target research: ${JSON.stringify(researchData)}\nOur project: ${projectContext}` }],
    maxTokens: 512
  });

  const outreach = {
    id: `bd_${Date.now()}`,
    target: target.handle || target.name,
    channel,
    project: projectContext,
    research: researchData,
    message: JSON.parse(message),
    status: 'draft',
    sentAt: null,
    generatedAt: new Date().toISOString()
  };

  const log = loadLog();
  log.push(outreach);
  writeFileSync(LOG_PATH, JSON.stringify(log, null, 2));

  return outreach;
}

export function updateOutreachStatus(id, status, notes = '') {
  const log = loadLog();
  const entry = log.find(e => e.id === id);
  if (entry) {
    entry.status = status;
    entry.updatedAt = new Date().toISOString();
    if (notes) entry.notes = notes;
    if (status === 'sent') entry.sentAt = new Date().toISOString();
    if (status === 'replied') notifier.opportunity(`BD reply received from ${entry.target}!`);
    writeFileSync(LOG_PATH, JSON.stringify(log, null, 2));
  }
  return entry;
}

export function getConversionStats() {
  const log = loadLog();
  return {
    total: log.length,
    sent: log.filter(e => e.status === 'sent').length,
    replied: log.filter(e => e.status === 'replied').length,
    converted: log.filter(e => e.status === 'converted').length,
    conversionRate: `${((log.filter(e => e.status === 'converted').length / Math.max(log.length, 1)) * 100).toFixed(1)}%`
  };
}
