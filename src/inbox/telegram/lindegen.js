/**
 * @lindegen Telegram - Monitor specific folders (Jei defines)
 */

import { callClaude } from '../../core/claudeAPI.js';
import { Notifier } from '../../core/notifier.js';
import { extractJson } from '../../core/jsonParse.js';
import { writeJsonSafe } from '../../core/storage.js';

const notifier = new Notifier();
const TODAY = new Date().toISOString().split('T')[0].replace(/-/g, '/');
const ACCOUNT = '@lindegen';

const MONITORED_FOLDERS = [];

export async function classifyMessage(message, folder = 'default') {
  const { text } = await callClaude({
    system: `Classify this Telegram message for ${ACCOUNT}. Categories: urgent (<2h reply)|normal (reply today)|fyi (no reply). Extract action items. Detect: deal, investor, partnership, deadline mentions. Output JSON: { category, urgency, actionItems, keyInfo, summary }.`,
    messages: [{ role: 'user', content: `Folder: ${folder}\nSender: ${message.from}\nMessage: ${message.text}` }],
    maxTokens: 512
  });

  const result = extractJson(text);
  result.account = ACCOUNT;
  result.folder = folder;
  result.processedAt = new Date().toISOString();

  if (result.category === 'urgent') {
    notifier.urgent(`Telegram ${ACCOUNT} [${folder}]: ${result.summary}`);
  }

  writeJsonSafe(`./files/inbox/telegram/${TODAY}/${Date.now()}-lindegen.json`, result);
  return result;
}

export function setMonitoredFolders(folders) {
  MONITORED_FOLDERS.length = 0;
  MONITORED_FOLDERS.push(...folders);
  notifier.alert('REMINDER', `${ACCOUNT} monitoring folders: ${folders.join(', ')}`);
}
