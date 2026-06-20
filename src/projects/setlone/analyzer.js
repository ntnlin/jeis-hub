/**
 * Setlone - Project Analyze Module
 * TBD - Jei defines persona, keywords, and network
 */

import { callClaude } from '../../core/claudeAPI.js';
import { DataValidator } from '../../core/dataValidator.js';
import { Notifier } from '../../core/notifier.js';
import { extractJson } from '../../core/jsonParse.js';
import { writeJsonSafe } from '../../core/storage.js';

const validator = new DataValidator();
const notifier = new Notifier();
const TODAY = new Date().toISOString().split('T')[0].replace(/-/g, '/');
const DATA_PATH = `./files/projects/setlone/${TODAY}`;

export async function analyzeUserData(rawData) {
  validator.assertProject('setlone');
  const stamped = validator.stamp(rawData, rawData.source || 'manual_input');

  const { text } = await callClaude({
    system: `You analyze Setlone (project TBD - details to be defined by Jei) user data. Extract what you can: DAU/WAU/MAU, retention, churn, peak hours, session duration, power users, growth signals. Output JSON. Never fabricate. Mark missing fields as null.`,
    messages: [{ role: 'user', content: JSON.stringify(stamped) }],
    maxTokens: 2048
  });

  const result = { analysis: extractJson(text), meta: { source: stamped.source, timestamp: stamped.timestamp, confidence: stamped.confidence } };
  writeJsonSafe(`${DATA_PATH}/user-data.json`, result);
  notifier.warning('Setlone is TBD - keywords and competitors not yet defined. Update config/projects/setlone.config.json');
  return result;
}

export async function analyzeCompetitorData(rawData) {
  validator.assertProject('setlone');
  notifier.warning('Setlone competitor list is TBD - Jei must define in config');
  const stamped = validator.stamp(rawData, rawData.source || 'manual_input');

  const { text } = await callClaude({
    system: `Analyze Setlone competitor data (project TBD). Extract available insights. Output JSON. Never fabricate.`,
    messages: [{ role: 'user', content: JSON.stringify(stamped) }],
    maxTokens: 2048
  });

  const result = { analysis: extractJson(text), meta: { source: stamped.source, timestamp: stamped.timestamp, confidence: stamped.confidence } };
  writeJsonSafe(`${DATA_PATH}/competitor-data.json`, result);
  return result;
}

export async function analyzeSNS(rawData) {
  notifier.warning('Setlone SNS keywords not yet defined. Update config/projects/setlone.config.json with snsKeywords array.');
  return { project: 'setlone', warning: 'keywords_not_defined', timestamp: new Date().toISOString() };
}
