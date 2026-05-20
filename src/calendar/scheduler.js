/**
 * Calendar Scheduler - Auto-sync deadlines, events, content, keywords
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import cron from 'node-cron';
import { Notifier } from '../core/notifier.js';
import { callClaude } from '../core/claudeAPI.js';

const notifier = new Notifier();
const CAL_PATH = `./files/calendar`;

const ENTRY_TYPES = { DEADLINE: 'red', CONTENT: 'blue', MEETING: 'green', PERSONAL: 'purple', BD: 'orange' };

export function createEntry(entry) {
  const record = {
    id: `evt_${Date.now()}`,
    date: entry.date,
    type: entry.type,
    color: ENTRY_TYPES[entry.type] || 'gray',
    title: entry.title,
    description: entry.description || '',
    project: entry.project || null,
    reminders: getReminders(entry),
    createdAt: new Date().toISOString(),
    source: entry.source || 'manual',
    editable: true
  };

  const datePath = `${CAL_PATH}/${entry.date.replace(/-/g, '/')}-schedule.json`;
  const existing = existsSync(datePath) ? JSON.parse(readFileSync(datePath, 'utf8')) : { entries: [] };
  existing.entries.push(record);
  writeFileSync(datePath, JSON.stringify(existing, null, 2));
  return record;
}

export async function addDailySNSSummary(date, snsData) {
  const { text } = await callClaude({
    system: `Summarize SNS keyword data for calendar entry. Extract: top 10 viral tweets, trending keywords, content recommendations. Output JSON: { top10Tweets: [], keywordSummary: [], contentRecommendations: [] }.`,
    messages: [{ role: 'user', content: JSON.stringify(snsData) }],
    maxTokens: 2048
  });

  const summary = JSON.parse(text);
  const keyPath = `${CAL_PATH}/${date.replace(/-/g, '/')}-keywords.json`;
  writeFileSync(keyPath, JSON.stringify({ date, ...summary, createdAt: new Date().toISOString() }, null, 2));
  return summary;
}

export function syncFromStrategy(strategy) {
  const tasks = strategy.weeklyPlan?.tasks || strategy.tasks || [];
  tasks.forEach(task => {
    if (task.deadline) {
      createEntry({ date: task.deadline.split('T')[0], type: 'DEADLINE', title: task.description, project: strategy.project, source: 'strategy_auto_sync' });
    }
  });
}

export function extractAndAddFromEmail(email, actionItems) {
  actionItems.forEach(item => {
    if (item.deadline) {
      createEntry({ date: item.deadline, type: 'DEADLINE', title: item.action, description: `From email: ${email.subject}`, source: 'email_auto_extract' });
    }
  });
}

function getReminders(entry) {
  if (entry.type === 'DEADLINE') return [{ before: '24h', channel: 'dashboard' }];
  if (entry.type === 'MEETING') return [{ before: '1h', channel: 'dashboard' }, { before: '24h', channel: 'dashboard' }];
  return [];
}

export function startReminderCron() {
  cron.schedule('0 * * * *', () => {
    const now = new Date();
    notifier.reminder(`Hourly check - ${now.toISOString()}`);
  });
}
