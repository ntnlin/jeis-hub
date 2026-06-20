/**
 * lindotfun@gmail.com - General inbox (priority: high, no filter)
 */

import { callClaude } from '../../core/claudeAPI.js';
import { Notifier } from '../../core/notifier.js';
import { extractJson } from '../../core/jsonParse.js';
import { writeJsonSafe } from '../../core/storage.js';

const notifier = new Notifier();
const TODAY = new Date().toISOString().split('T')[0].replace(/-/g, '/');
const ACCOUNT = 'lindotfun@gmail.com';

export async function processEmail(email) {
  const { text } = await callClaude({
    system: `You process emails for ${ACCOUNT} (Jei's general inbox). Classify: urgent|normal|spam|newsletter. Extract: action items, deadlines, key info. Flag: investor/BD/partnership emails as HIGH PRIORITY. Output JSON: { category, priority, summary, actionItems, calendarItems, from, subject }.`,
    messages: [{ role: 'user', content: JSON.stringify(email) }],
    maxTokens: 1024
  });

  const result = extractJson(text);
  result.account = ACCOUNT;
  result.processedAt = new Date().toISOString();
  result.readOnly = true;

  if (result.priority === 'urgent' || result.category === 'investor') {
    notifier.urgent(`${ACCOUNT}: ${result.subject} - ${result.summary}`);
  }

  writeJsonSafe(`./files/inbox/email/${TODAY}/${ACCOUNT.replace('@', '_').replace('.', '_')}-${Date.now()}.json`, result);
  return result;
}

export async function generateDailyDigest(emails) {
  const { text } = await callClaude({
    system: `Summarize these emails for ${ACCOUNT}. Output: { urgent: [], normal: [], actionItems: [], total: number } JSON.`,
    messages: [{ role: 'user', content: JSON.stringify(emails) }],
    maxTokens: 1024
  });
  return { account: ACCOUNT, date: TODAY, ...extractJson(text) };
}
