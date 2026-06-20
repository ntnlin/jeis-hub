/**
 * ntnlin9@gmail.com - Spam inbox (aggressive filter)
 * Only surface: investor, partnership, deal, grant, important
 */

import { callClaude } from '../../core/claudeAPI.js';
import { Notifier } from '../../core/notifier.js';
import { extractJson } from '../../core/jsonParse.js';
import { writeJsonSafe } from '../../core/storage.js';

const notifier = new Notifier();
const TODAY = new Date().toISOString().split('T')[0].replace(/-/g, '/');
const ACCOUNT = 'ntnlin9@gmail.com';
const SURFACE_KEYWORDS = ['investor', 'investment', 'partnership', 'deal', 'grant', 'funding', 'opportunity', 'bd', 'collab'];

export async function processEmail(email) {
  const emailText = JSON.stringify(email).toLowerCase();
  const shouldSurface = SURFACE_KEYWORDS.some(k => emailText.includes(k));

  if (!shouldSurface) {
    return { deleted: true, reason: 'aggressive_filter', account: ACCOUNT, from: email.from };
  }

  const { text } = await callClaude({
    system: `Filter email for ${ACCOUNT} (Jei's spam inbox). Only surface: investor/partnership/deal/grant/important emails. Classify why this is important. Output JSON: { surfaceReason, priority, summary, actionItems, from, subject }.`,
    messages: [{ role: 'user', content: JSON.stringify(email) }],
    maxTokens: 512
  });

  const result = extractJson(text);
  result.account = ACCOUNT;
  result.processedAt = new Date().toISOString();
  result.readOnly = true;

  if (result.priority === 'high') {
    notifier.opportunity(`ntnlin9 surfaced: ${result.subject} - ${result.surfaceReason}`);
  }

  writeJsonSafe(`./files/inbox/email/${TODAY}/${Date.now()}-ntnlin9.json`, result);
  return result;
}
