/**
 * jeivyoung@gmail.com - General Web3 inbox (priority: high, no filter)
 */

import { callClaude } from '../../core/claudeAPI.js';
import { Notifier } from '../../core/notifier.js';
import { extractJson } from '../../core/jsonParse.js';
import { writeJsonSafe } from '../../core/storage.js';

const notifier = new Notifier();
const TODAY = new Date().toISOString().split('T')[0].replace(/-/g, '/');
const ACCOUNT = 'jeivyoung@gmail.com';

export async function processEmail(email) {
  const { text } = await callClaude({
    system: `Process emails for ${ACCOUNT} (Jei's general Web3 inbox). Classify: urgent|normal|spam|newsletter. Extract: action items, deadlines, key info. Flag: investor/BD/partnership as HIGH PRIORITY. Output JSON: { category, priority, summary, actionItems, calendarItems, from, subject }.`,
    messages: [{ role: 'user', content: JSON.stringify(email) }],
    maxTokens: 1024
  });

  const result = extractJson(text);
  result.account = ACCOUNT;
  result.processedAt = new Date().toISOString();
  result.readOnly = true;

  if (result.priority === 'urgent') {
    notifier.urgent(`${ACCOUNT}: ${result.subject}`);
  }

  writeJsonSafe(`./files/inbox/email/${TODAY}/${Date.now()}-jeivyoung.json`, result);
  return result;
}

export async function generateDailyDigest(emails) {
  const { text } = await callClaude({
    system: `Summarize emails for ${ACCOUNT}. Output JSON: { urgent: [], normal: [], actionItems: [], total: number }.`,
    messages: [{ role: 'user', content: JSON.stringify(emails) }],
    maxTokens: 1024
  });
  return { account: ACCOUNT, date: TODAY, ...extractJson(text) };
}
