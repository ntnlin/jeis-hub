/**
 * Setlone - Marketing Module (TBD)
 */

import { callClaude } from '../../core/claudeAPI.js';
import { DataValidator } from '../../core/dataValidator.js';
import { Notifier } from '../../core/notifier.js';
import { extractJson } from '../../core/jsonParse.js';
import { writeJsonSafe } from '../../core/storage.js';

const validator = new DataValidator();
const notifier = new Notifier();
const TODAY = new Date().toISOString().split('T')[0].replace(/-/g, '/');

export async function generateCampaignBrief(strategy, campaignGoal) {
  validator.assertProject('setlone');
  notifier.warning('Setlone TBD - campaign will be placeholder until project defined');

  const { text } = await callClaude({
    system: `Create a placeholder marketing campaign brief for Setlone (TBD project). Make it flexible and editable. Output JSON.`,
    messages: [{ role: 'user', content: `Strategy: ${JSON.stringify(strategy)}\nGoal: ${campaignGoal}` }],
    maxTokens: 2048
  });

  const campaign = { project: 'setlone', isTBD: true, status: 'draft', createdAt: new Date().toISOString(), brief: extractJson(text) };
  writeJsonSafe(`./files/projects/setlone/${TODAY}/marketing.json`, campaign);
  return campaign;
}
