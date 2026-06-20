/**
 * Syzy - Marketing Module
 */

import { callClaude } from '../../core/claudeAPI.js';
import { DataValidator } from '../../core/dataValidator.js';
import { extractJson } from '../../core/jsonParse.js';
import { writeJsonSafe } from '../../core/storage.js';

const validator = new DataValidator();
const TODAY = new Date().toISOString().split('T')[0].replace(/-/g, '/');

export async function generateCampaignBrief(strategy, campaignGoal) {
  validator.assertProject('syzy');

  const { text } = await callClaude({
    system: `Create marketing campaign briefs for Syzy (Stellar prediction market). Community-driven, referral-focus, beta growth. Include: name, goal, audience, channels, content types, timeline, budget, metrics. Output JSON.`,
    messages: [{ role: 'user', content: `Strategy: ${JSON.stringify(strategy)}\nGoal: ${campaignGoal}` }],
    maxTokens: 2048
  });

  const campaign = { project: 'syzy', status: 'draft', createdAt: new Date().toISOString(), brief: extractJson(text) };
  writeJsonSafe(`./files/projects/syzy/${TODAY}/marketing.json`, campaign);
  return campaign;
}

export async function generateContentCalendar(month, themes) {
  const { text } = await callClaude({
    system: `Create monthly content calendar for Syzy (Stellar prediction market). Community-first tone. Include weekly themes, content types, schedule, channels. Output JSON.`,
    messages: [{ role: 'user', content: `Month: ${month}\nThemes: ${JSON.stringify(themes)}` }],
    maxTokens: 2048
  });
  return { project: 'syzy', month, calendar: extractJson(text), createdAt: new Date().toISOString() };
}
