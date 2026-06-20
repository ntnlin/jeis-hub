/**
 * Vezta - Marketing Module
 * Campaigns, schedules, content themes, competitor learning
 */

import { callClaude } from '../../core/claudeAPI.js';
import { DataValidator } from '../../core/dataValidator.js';
import { extractJson } from '../../core/jsonParse.js';
import { writeJsonSafe } from '../../core/storage.js';

const validator = new DataValidator();
const TODAY = new Date().toISOString().split('T')[0].replace(/-/g, '/');
const DATA_PATH = `./files/projects/vezta/${TODAY}`;

export async function generateCampaignBrief(strategy, campaignGoal) {
  validator.assertProject('vezta');

  const { text } = await callClaude({
    system: `You create marketing campaign briefs for Vezta (Solana prediction market). Generate: campaign name, goal, target audience, channel strategy (X/Discord/Telegram/Blog), content types, timeline, budget allocation, success metrics, performance tracking plan. Base on provided strategy. Output JSON.`,
    messages: [{ role: 'user', content: `Strategy: ${JSON.stringify(strategy)}\nGoal: ${campaignGoal}` }],
    maxTokens: 2048
  });

  const campaign = {
    project: 'vezta',
    status: 'draft',
    createdAt: new Date().toISOString(),
    brief: extractJson(text),
    performance: { impressions: null, conversions: null, cac: null }
  };

  writeJsonSafe(`${DATA_PATH}/marketing.json`, campaign);
  return campaign;
}

export async function generateContentCalendar(month, themes) {
  const { text } = await callClaude({
    system: `Create a monthly content calendar for Vezta (Solana prediction market). Include: weekly themes, daily content types (tweet/thread/blog/announcement), posting schedule, channel per content type. Output JSON with weeks array.`,
    messages: [{ role: 'user', content: `Month: ${month}\nThemes: ${JSON.stringify(themes)}` }],
    maxTokens: 2048
  });

  return { project: 'vezta', month, calendar: extractJson(text), createdAt: new Date().toISOString() };
}
