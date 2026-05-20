/**
 * Syzy - Growth Strategy Module
 */

import { readFileSync, writeFileSync } from 'fs';
import { callClaude } from '../../core/claudeAPI.js';
import { DataValidator } from '../../core/dataValidator.js';

const validator = new DataValidator();
const TODAY = new Date().toISOString().split('T')[0].replace(/-/g, '/');

export async function generateMonthlyStrategy(context) {
  validator.assertProject('syzy');

  const { text } = await callClaude({
    system: `You are a growth strategist for Syzy (Stellar prediction market). Community-first, referral-driven, XLM/USDC focus. Generate monthly strategy: goal, 3-5 initiatives, channel strategy, budget, metrics. Output JSON.`,
    messages: [{ role: 'user', content: `Context: ${JSON.stringify(context)}` }],
    maxTokens: 3000
  });

  const strategy = {
    project: 'syzy', period: 'monthly', status: 'draft',
    generatedAt: new Date().toISOString(), approvalStatus: 'pending_jei_review',
    strategy: JSON.parse(text), editHistory: []
  };

  writeFileSync(`./files/projects/syzy/${TODAY}/strategy.json`, JSON.stringify(strategy, null, 2));
  return strategy;
}

export async function generateWeeklyPlan(monthlyStrategy, weekNumber) {
  const { text } = await callClaude({
    system: `Break down Syzy monthly strategy into week ${weekNumber} tasks. Each: description, deadline (ISO), owner, priority, metric, status (pending). Output JSON array.`,
    messages: [{ role: 'user', content: JSON.stringify(monthlyStrategy) }],
    maxTokens: 2048
  });
  return { week: weekNumber, tasks: JSON.parse(text), status: 'pending_jei_approval' };
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
