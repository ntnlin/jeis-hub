/**
 * Tasmil - Marketing Module | DeFAI ONLY - NOT RWA
 */

import { callClaude } from '../../core/claudeAPI.js';
import { DataValidator } from '../../core/dataValidator.js';
import { extractJson } from '../../core/jsonParse.js';
import { writeJsonSafe } from '../../core/storage.js';

const validator = new DataValidator();
const TODAY = new Date().toISOString().split('T')[0].replace(/-/g, '/');

export async function generateCampaignBrief(strategy, campaignGoal) {
  validator.assertProject('tasmil');
  validator.checkTasmilRWA('tasmil', campaignGoal);

  const { text } = await callClaude({
    system: `Create marketing campaign briefs for Tasmil (DeFAI on Stellar). DeFAI = AI-powered autonomous finance. NEVER RWA. Include: campaign name, goal, audience, channels, content types, timeline, budget, success metrics. Output JSON.`,
    messages: [{ role: 'user', content: `Strategy: ${JSON.stringify(strategy)}\nGoal: ${campaignGoal}` }],
    maxTokens: 2048
  });

  const campaign = { project: 'tasmil', defaiOnly: true, status: 'draft', createdAt: new Date().toISOString(), brief: extractJson(text) };
  validator.checkTasmilRWA('tasmil', JSON.stringify(campaign));
  writeJsonSafe(`./files/projects/tasmil/${TODAY}/marketing.json`, campaign);
  return campaign;
}

export async function generateContentCalendar(month, themes) {
  themes.forEach(t => validator.checkTasmilRWA('tasmil', t));

  const { text } = await callClaude({
    system: `Create monthly content calendar for Tasmil (DeFAI on Stellar - AI autonomous finance, NOT RWA). Include weekly themes, content types, schedule, channel per content. Output JSON.`,
    messages: [{ role: 'user', content: `Month: ${month}\nThemes: ${JSON.stringify(themes)}` }],
    maxTokens: 2048
  });

  return { project: 'tasmil', month, calendar: extractJson(text), createdAt: new Date().toISOString() };
}
