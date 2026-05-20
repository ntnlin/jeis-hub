/**
 * @janerebos - DM management (persona TBD)
 */

import { writeFileSync } from 'fs';
import { callClaude } from '../../core/claudeAPI.js';
import { Notifier } from '../../core/notifier.js';

const notifier = new Notifier();
const TODAY = new Date().toISOString().split('T')[0].replace(/-/g, '/');

export async function classifyIncomingDM(dmText, senderHandle) {
  const { text } = await callClaude({
    system: `Classify this DM for @janerebos. Categories: urgent (<2h), normal (today), fyi (no reply), spam. Extract action items. Output JSON: { category, urgency, actionItems, summary }.`,
    messages: [{ role: 'user', content: `Sender: ${senderHandle}\nMessage: ${dmText}` }],
    maxTokens: 512
  });
  return { ...JSON.parse(text), account: 'janerebos', sender: senderHandle, receivedAt: new Date().toISOString() };
}

export async function composeDM(target, purpose) {
  notifier.warning('@janerebos persona TBD - DM voice will be generic until persona defined');

  const { text } = await callClaude({
    system: `Write a DM from @janerebos (Web3 account, persona TBD) to ${target}. Short, specific, no generic opener. Output JSON: { body, tone }.`,
    messages: [{ role: 'user', content: `Target: ${target}\nPurpose: ${purpose}` }],
    maxTokens: 512
  });

  const dm = { ...JSON.parse(text), account: 'janerebos', target, purpose, generatedAt: new Date().toISOString(), status: 'draft' };
  writeFileSync(`./files/accounts/janerebos/${TODAY}/dms.md`, `# @janerebos DM - ${new Date().toISOString()}\n\n**To:** ${target}\n\n${dm.body}\n---\n`, { flag: 'a' });
  return dm;
}
