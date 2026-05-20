/**
 * liniean Discord - DMs inbox only
 */

import { writeFileSync } from 'fs';
import { callClaude } from '../../core/claudeAPI.js';
import { Notifier } from '../../core/notifier.js';

const notifier = new Notifier();
const TODAY = new Date().toISOString().split('T')[0].replace(/-/g, '/');
const ACCOUNT = 'liniean';

export async function classifyDM(message) {
  const { text } = await callClaude({
    system: `Classify this Discord DM for ${ACCOUNT}. Categories: urgent (<2h reply)|normal (today)|fyi. Extract: action items, opportunities, key info. Detect: partnership, investment, collab, project mentions. Output JSON: { category, urgency, actionItems, opportunities, summary, suggestedReply }.`,
    messages: [{ role: 'user', content: `From: ${message.from}\nMessage: ${message.text}` }],
    maxTokens: 512
  });

  const result = JSON.parse(text);
  result.account = ACCOUNT;
  result.platform = 'discord';
  result.processedAt = new Date().toISOString();

  if (result.category === 'urgent') {
    notifier.urgent(`Discord ${ACCOUNT}: ${result.summary}`);
  }

  writeFileSync(`./files/inbox/discord/${TODAY}/${Date.now()}-liniean.json`, JSON.stringify(result, null, 2));
  return result;
}

export async function generateReply(messageContext, tone = 'casual') {
  const { text } = await callClaude({
    system: `Generate a ${tone} Discord reply for ${ACCOUNT}. Rules: relevant, specific, never generic, never shill. Short and direct.`,
    messages: [{ role: 'user', content: JSON.stringify(messageContext) }],
    maxTokens: 256
  });
  return { reply: text, tone, account: ACCOUNT, generatedAt: new Date().toISOString(), status: 'pending_jei_approval' };
}
