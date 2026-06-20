/**
 * Tasmil - Project Analyze Module
 * CRITICAL: DeFAI ONLY - NOT RWA
 */

import { readFileSync } from 'fs';
import { callClaude } from '../../core/claudeAPI.js';
import { DataValidator } from '../../core/dataValidator.js';
import { Notifier } from '../../core/notifier.js';
import { extractJson } from '../../core/jsonParse.js';
import { writeJsonSafe } from '../../core/storage.js';

const CONFIG = JSON.parse(readFileSync('./config/projects/tasmil.config.json', 'utf8'));
const validator = new DataValidator();
const notifier = new Notifier();
const TODAY = new Date().toISOString().split('T')[0].replace(/-/g, '/');
const DATA_PATH = `./files/projects/tasmil/${TODAY}`;

function assertNotRWA(content) {
  const check = validator.checkTasmilRWA('tasmil', JSON.stringify(content));
  if (check.flagged) throw new Error(`TASMIL RWA VIOLATION: ${check.terms.join(', ')}`);
}

export async function analyzeUserData(rawData) {
  assertNotRWA(rawData);
  validator.assertProject('tasmil');
  const stamped = validator.stamp(rawData, rawData.source || 'manual_input');

  const { text } = await callClaude({
    system: `You analyze Tasmil (DeFAI protocol on Stellar - AI-powered autonomous finance, NOT RWA) user data. Extract: DAU/WAU/MAU, retention, churn, peak hours, session duration, power user traits, growth signals, churn risk. Output JSON. Never fabricate. NEVER mention RWA.`,
    messages: [{ role: 'user', content: JSON.stringify(stamped) }],
    maxTokens: 2048
  });

  const result = { analysis: extractJson(text), meta: { source: stamped.source, timestamp: stamped.timestamp, confidence: stamped.confidence } };
  assertNotRWA(result);
  writeJsonSafe(`${DATA_PATH}/user-data.json`, result);
  return result;
}

export async function analyzeCompetitorData(rawData) {
  assertNotRWA(rawData);
  validator.assertProject('tasmil');
  const stamped = validator.stamp(rawData, rawData.source || 'manual_input');

  const { text } = await callClaude({
    system: `You analyze Tasmil competitors (DeFAI space: AI-powered autonomous finance protocols on Stellar). Extract: feature updates, user sentiment, viral content, why users choose them, keyword tracking. NEVER discuss RWA competitors. Output JSON.`,
    messages: [{ role: 'user', content: JSON.stringify(stamped) }],
    maxTokens: 2048
  });

  const result = { analysis: extractJson(text), meta: { source: stamped.source, timestamp: stamped.timestamp, confidence: stamped.confidence } };
  assertNotRWA(result);
  writeJsonSafe(`${DATA_PATH}/competitor-data.json`, result);
  return result;
}

export async function analyzeSNS(rawData) {
  assertNotRWA(rawData);
  validator.assertProject('tasmil');
  const keywords = CONFIG.snsKeywords;

  const { text } = await callClaude({
    system: `You analyze SNS data for Tasmil (DeFAI - AI-powered autonomous finance on Stellar). Keywords: ${keywords.join(', ')}. Extract: top 10 tweets per keyword, velocity, sentiment, emerging keywords. Output JSON. NEVER reference RWA content.`,
    messages: [{ role: 'user', content: JSON.stringify(rawData) }],
    maxTokens: 3000
  });

  const result = { keywords, analysis: extractJson(text), meta: { timestamp: new Date().toISOString(), confidence: 75 } };
  assertNotRWA(result);
  writeJsonSafe(`${DATA_PATH}/sns-data.json`, result);
  notifier.opportunity(`Tasmil SNS analysis complete. DeFAI keywords tracked: ${keywords.length}`);
  return result;
}
