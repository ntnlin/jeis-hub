/**
 * Setlone - Growth Strategy Module (TBD)
 */

import { readFileSync, writeFileSync } from 'fs';
import { callClaude } from '../../core/claudeAPI.js';
import { DataValidator } from '../../core/dataValidator.js';
import { Notifier } from '../../core/notifier.js';
import { extractJson } from '../../core/jsonParse.js';
import { writeJsonSafe } from '../../core/storage.js';

const validator = new DataValidator();
const notifier = new Notifier();
const TODAY = new Date().toISOString().split('T')[0].replace(/-/g, '/');

export async function generateMonthlyStrategy(context) {
  validator.assertProject('setlone');
  notifier.warning('Setlone: project details TBD. Strategy will be generic until Jei defines the project.');

  const { text } = await callClaude({
    system: `Generate a placeholder monthly growth strategy for Setlone (project TBD - details to be defined by Jei). Make it adaptable. Output JSON with: goal (placeholder), initiatives (3 generic), channels, budget (TBD), metrics (TBD).`,
    messages: [{ role: 'user', content: `Context: ${JSON.stringify(context)}` }],
    maxTokens: 2048
  });

  const strategy = {
    project: 'setlone', period: 'monthly', status: 'draft', isTBD: true,
    generatedAt: new Date().toISOString(), approvalStatus: 'pending_jei_review',
    strategy: extractJson(text), editHistory: [],
    note: 'Jei must define project details before finalizing strategy'
  };

  writeJsonSafe(`./files/projects/setlone/${TODAY}/strategy.json`, strategy);
  return strategy;
}

export function approveStrategy(strategyPath, approved = true, edits = null) {
  const data = JSON.parse(readFileSync(strategyPath, 'utf8'));
  data.approvalStatus = approved ? 'approved' : 'rejected';
  data.approvedAt = new Date().toISOString();
  data.editHistory.push({ action: approved ? 'approved' : 'rejected', at: data.approvedAt, edits });
  if (edits) data.strategy = { ...data.strategy, ...edits };
  writeFileSync(strategyPath, JSON.stringify(data, null, 2));
  return data;
}
