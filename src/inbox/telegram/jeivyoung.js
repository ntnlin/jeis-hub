/**
 * @jeivyoung Telegram - Monitor specific folders (Jei defines)
 */

import { callClaude } from '../../core/claudeAPI.js';
import { Notifier } from '../../core/notifier.js';
import { extractJson } from '../../core/jsonParse.js';
import { writeJsonSafe } from '../../core/storage.js';

const notifier = new Notifier();
const TODAY = new Date().toISOString().split('T')[0].replace(/-/g, '/');
const ACCOUNT = '@jeivyoung';

export async function classifyMessage(message, folder = 'default') {
  const { text } = await callClaude({
    system: `Classify Telegram message for ${ACCOUNT}. Categories: urgent (<2h)|normal (today)|fyi. Extract action items, detect deals/investors/deadlines. Output JSON: { category, urgency, actionItems, keyInfo, summary }.`,
    messages: [{ role: 'user', content: `Folder: ${folder}\nSender: ${message.from}\nMessage: ${message.text}` }],
    maxTokens: 512
  });

  const result = extractJson(text);
  result.account = ACCOUNT;
  result.folder = folder;
  result.processedAt = new Date().toISOString();

  if (result.category === 'urgent') {
    notifier.urgent(`Telegram ${ACCOUNT}: ${result.summary}`);
  }

  writeJsonSafe(`./files/inbox/telegram/${TODAY}/${Date.now()}-jeivyoung.json`, result);
  return result;
}
