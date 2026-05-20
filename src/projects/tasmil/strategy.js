/**
 * Tasmil - Growth Strategy Module
 * CRITICAL: DeFAI ONLY - NOT RWA
 */

import { readFileSync, writeFileSync } from 'fs';
import { callClaude } from '../../core/claudeAPI.js';
import { DataValidator } from '../../core/dataValidator.js';

const validator = new DataValidator();
const TODAY = new Date().toISOString().split('T')[0].replace(/-/g, '/');
const DATA_PATH = `./files/projects/tasmil/${TODAY}`;

export async function generateMonthlyStrategy(context) {
  validator.assertProject('tasmil');
  validator.checkTasmilRWA('tasmil', JSON.stringify(context));

  const { text } = await callClaude({
    system: `You are a DeFAI growth strategist for Tasmil (AI-powered autonomous finance on Stellar). DeFAI ONLY - NEVER RWA. Generate monthly strategy: measurable goal, 3-5 initiatives, channel strategy, budget allocation, success metrics. Focus: AI agents, autonomous finance, Stellar ecosystem. Output JSON.`,
    messages: [{ role: 'user', content: `Context: ${JSON.stringify(context)}` }],
    maxTokens: 3000
  });

  const strategy = {
    project: 'tasmil',
    period: 'monthly',
    status: 'draft',
    defaiOnly: true,
    generatedAt: new Date().toISOString(),
    approvalStatus: 'pending_jei_review',
    strategy: JSON.parse(text),
    editHistory: []
  };

  const check = validator.checkTasmilRWA('tasmil', JSON.stringify(strategy));
  if (check.flagged) throw new Error('RWA content in generated strategy - blocked');

  writeFileSync(`${DATA_PATH}/strategy.json`, JSON.stringify(strategy, null, 2));
  return strategy;
}

export async function generateWeeklyPlan(monthlyStrategy, weekNumber) {
  const { text } = await callClaude({
    system: `Break down this Tasmil DeFAI monthly strategy into week ${weekNumber} tasks. Each task: description, deadline (ISO), owner (jei|auto), priority (high|medium|low), success metric, status (pending). Never include RWA-related tasks. Output JSON array.`,
    messages: [{ role: 'user', content: JSON.stringify(monthlyStrategy) }],
    maxTokens: 2048
  });

  return { week: weekNumber, tasks: JSON.parse(text), status: 'pending_jei_approval' };
}

export function approveStrategy(strategyPath, approved = true, edits = null) {
  const data = JSON.parse(readFileSync(strategyPath, 'utf8'));
  if (edits) validator.checkTasmilRWA('tasmil', JSON.stringify(edits));
  data.approvalStatus = approved ? 'approved' : 'rejected';
  data.approvedAt = new Date().toISOString();
  data.editHistory.push({ action: approved ? 'approved' : 'rejected', at: data.approvedAt, edits });
  if (edits) data.strategy = { ...data.strategy, ...edits };
  writeFileSync(strategyPath, JSON.stringify(data, null, 2));
  return data;
}
