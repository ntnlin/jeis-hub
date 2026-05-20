/**
 * jei@vezta.io - Vezta-only inbox (strict filter, high priority)
 * Alert: investor/BD/partnership emails immediately
 */

import { writeFileSync } from 'fs';
import { callClaude } from '../../core/claudeAPI.js';
import { Notifier } from '../../core/notifier.js';

const notifier = new Notifier();
const TODAY = new Date().toISOString().split('T')[0].replace(/-/g, '/');
const ACCOUNT = 'jei@vezta.io';
const ALERT_KEYWORDS = ['invest', 'partnership', 'bd', 'business development', 'deal', 'funding', 'grant', 'venture', 'vc', 'angel'];

export async function processEmail(email) {
  const emailText = JSON.stringify(email).toLowerCase();
  const isVezta = emailText.includes('vezta') || email.to?.includes('vezta.io');

  if (!isVezta) {
    notifier.warning(`Non-Vezta email detected at ${ACCOUNT} - blocking. From: ${email.from}`);
    return { blocked: true, reason: 'strict_filter_non_vezta', account: ACCOUNT };
  }

  const isHighPriority = ALERT_KEYWORDS.some(k => emailText.includes(k));

  const { text } = await callClaude({
    system: `Process email for ${ACCOUNT} (Vezta-only strict inbox). Classify: urgent|normal|spam|newsletter. Extract: action items, deadlines, investor/BD/partnership signals. Output JSON: { category, priority, isInvestor, isBD, isPartnership, summary, actionItems, from, subject }.`,
    messages: [{ role: 'user', content: JSON.stringify(email) }],
    maxTokens: 1024
  });

  const result = JSON.parse(text);
  result.account = ACCOUNT;
  result.processedAt = new Date().toISOString();
  result.readOnly = true;

  if (result.isInvestor || result.isBD || result.isPartnership || isHighPriority) {
    notifier.urgent(`🔴 VEZTA HIGH PRIORITY: ${result.subject} from ${result.from} - ${result.summary}`);
  }

  writeFileSync(`./files/inbox/email/${TODAY}/${Date.now()}-vezta.json`, JSON.stringify(result, null, 2));
  return result;
}
