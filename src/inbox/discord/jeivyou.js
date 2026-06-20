/**
 * jeivyou Discord - DMs inbox only
 */

import { callClaude } from '../../core/claudeAPI.js';
import { Notifier } from '../../core/notifier.js';
import { extractJson } from '../../core/jsonParse.js';
import { writeJsonSafe } from '../../core/storage.js';

const notifier = new Notifier();
const TODAY = new Date().toISOString().split('T')[0].replace(/-/g, '/');
const ACCOUNT = 'jeivyou';

export async function classifyDM(message) {
  const { text } = await callClaude({
    system: `Classify Discord DM for ${ACCOUNT}. Categories: urgent (<2h)|normal (today)|fyi. Extract: action items, opportunities. Detect: partnership, investment, collab. Output JSON: { category, urgency, actionItems, opportunities, summary }.`,
    messages: [{ role: 'user', content: `From: ${message.from}\nMessage: ${message.text}` }],
    maxTokens: 512
  });

  const result = extractJson(text);
  result.account = ACCOUNT;
  result.platform = 'discord';
  result.processedAt = new Date().toISOString();

  if (result.category === 'urgent') {
    notifier.urgent(`Discord ${ACCOUNT}: ${result.summary}`);
  }

  writeJsonSafe(`./files/inbox/discord/${TODAY}/${Date.now()}-jeivyou.json`, result);
  return result;
}

export async function generateReply(messageContext, tone = 'casual') {
  const { text } = await callClaude({
    system: `Generate a ${tone} Discord reply for @jeivyou. Direct, specific, never generic. No shill.`,
    messages: [{ role: 'user', content: JSON.stringify(messageContext) }],
    maxTokens: 256
  });
  return { reply: text, tone, account: ACCOUNT, generatedAt: new Date().toISOString(), status: 'pending_jei_approval' };
}
