/**
 * @jeivyou - DM management and outreach
 */

import { writeFileSync } from 'fs';
import { callClaude } from '../../core/claudeAPI.js';

const TODAY = new Date().toISOString().split('T')[0].replace(/-/g, '/');
const JEIVYOU_CONTEXT = '@jeivyou is Jei - Web3 operator. DMs: direct, specific, no generic intros. For BD: research target first, identify synergy, write short+specific. Never: "love your work", "huge fan", "great project".';

export async function classifyIncomingDM(dmText, senderHandle) {
  const { text } = await callClaude({
    system: `Classify this DM for @jeivyou. Categories: urgent (need reply <2h), normal (reply today), fyi (no reply needed), spam (ignore). Extract action items if any. Output JSON: { category, urgency, actionItems, summary }.`,
    messages: [{ role: 'user', content: `Sender: ${senderHandle}\nMessage: ${dmText}` }],
    maxTokens: 512
  });
  return { ...JSON.parse(text), sender: senderHandle, receivedAt: new Date().toISOString() };
}

export async function composeDM(target, purpose, projectContext = '') {
  const { text } = await callClaude({
    system: `Write a DM from @jeivyou to ${target}. Purpose: ${purpose}. ${JEIVYOU_CONTEXT} Rules: short (<3 sentences), specific, research-based, personal. No generic opening. Output JSON: { subject, body, tone }.`,
    messages: [{ role: 'user', content: `Target: ${target}\nPurpose: ${purpose}\nProject context: ${projectContext}` }],
    maxTokens: 512
  });

  const dm = { ...JSON.parse(text), account: 'jeivyou', target, purpose, generatedAt: new Date().toISOString(), status: 'draft' };
  writeFileSync(`./files/accounts/jeivyou/${TODAY}/dms.md`,
    `# @jeivyou DM - ${new Date().toISOString()}\n\n**To:** ${target}\n**Purpose:** ${purpose}\n\n${dm.body}\n---\n`,
    { flag: 'a' }
  );
  return dm;
}
