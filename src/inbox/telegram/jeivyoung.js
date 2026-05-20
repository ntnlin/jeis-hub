/**
 * @jeivyoung Telegram - Monitor specific folders (Jei defines)
 */

import { writeFileSync } from 'fs';
import { callClaude } from '../../core/claudeAPI.js';
import { Notifier } from '../../core/notifier.js';

const notifier = new Notifier();
const TODAY = new Date().toISOString().split('T')[0].replace(/-/g, '/');
const ACCOUNT = '@jeivyoung';

export async function classifyMessage(message, folder = 'default') {
  const { text } = await callClaude({
    system: `Classify Telegram message for ${ACCOUNT}. Categories: urgent (<2h)|normal (today)|fyi. Extract action items, detect deals/investors/deadlines. Output JSON: { category, urgency, actionItems, keyInfo, summary }.`,
    messages: [{ role: 'user', content: `Folder: ${folder}\nSender: ${message.from}\nMessage: ${message.text}` }],
    maxTokens: 512
  });

  const result = JSON.parse(text);
  result.account = ACCOUNT;
  result.folder = folder;
  result.processedAt = new Date().toISOString();

  if (result.category === 'urgent') {
    notifier.urgent(`Telegram ${ACCOUNT}: ${result.summary}`);
  }

  writeFileSync(`./files/inbox/telegram/${TODAY}/${Date.now()}-jeivyoung.json`, JSON.stringify(result, null, 2));
  return result;
}
