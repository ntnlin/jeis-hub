/**
 * Vezta - Growth Strategy Module
 * Monthly strategy + weekly plans + approval flow + learning
 */

import { readFileSync, writeFileSync } from 'fs';
import { callClaude } from '../../core/claudeAPI.js';
import { DataValidator } from '../../core/dataValidator.js';

const validator = new DataValidator();
const TODAY = new Date().toISOString().split('T')[0].replace(/-/g, '/');
const DATA_PATH = `./files/projects/vezta/${TODAY}`;

export async function generateMonthlyStrategy(context) {
  validator.assertProject('vezta');

  const { text } = await callClaude({
    system: `You are a Web3 growth strategist for Vezta (Solana prediction market). Generate a monthly growth strategy with: measurable goal, 3-5 key initiatives, channel strategy (X/Discord/Telegram/Blog), budget allocation, success metrics. Apply growth loop frameworks. Output JSON. Never fabricate data - use provided context only.`,
    messages: [{ role: 'user', content: `Context: ${JSON.stringify(context)}\nGenerate monthly strategy for Vezta.` }],
    maxTokens: 3000
  });

  const strategy = {
    project: 'vezta',
    period: 'monthly',
    status: 'draft',
    generatedAt: new Date().toISOString(),
    approvalStatus: 'pending_jei_review',
    strategy: JSON.parse(text),
    editHistory: []
  };

  writeFileSync(`${DATA_PATH}/strategy.json`, JSON.stringify(strategy, null, 2));
  return strategy;
}

export async function generateWeeklyPlan(monthlyStrategy, weekNumber) {
  const { text } = await callClaude({
    system: `Break down this Vezta monthly strategy into week ${weekNumber} tasks. Each task needs: description, deadline (ISO), owner (jei|auto), priority (high|medium|low), success metric, status (pending). Output JSON array.`,
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
