/**
 * Syzy - Project Analyze Module
 * Stellar prediction market
 */

import { readFileSync, writeFileSync } from 'fs';
import { callClaude } from '../../core/claudeAPI.js';
import { DataValidator } from '../../core/dataValidator.js';
import { Notifier } from '../../core/notifier.js';

const CONFIG = JSON.parse(readFileSync('./config/projects/syzy.config.json', 'utf8'));
const validator = new DataValidator();
const notifier = new Notifier();
const TODAY = new Date().toISOString().split('T')[0].replace(/-/g, '/');
const DATA_PATH = `./files/projects/syzy/${TODAY}`;

export async function analyzeUserData(rawData) {
  validator.assertProject('syzy');
  const stamped = validator.stamp(rawData, rawData.source || 'manual_input');

  const { text } = await callClaude({
    system: `You analyze Syzy (prediction market on Stellar) user data. Extract: DAU/WAU/MAU, retention, churn, peak hours, session duration, power user traits (beta users, referral active), growth signals, churn risk. Output JSON. Never fabricate.`,
    messages: [{ role: 'user', content: JSON.stringify(stamped) }],
    maxTokens: 2048
  });

  const result = { analysis: JSON.parse(text), meta: { source: stamped.source, timestamp: stamped.timestamp, confidence: stamped.confidence } };
  writeFileSync(`${DATA_PATH}/user-data.json`, JSON.stringify(result, null, 2));
  return result;
}

export async function analyzeCompetitorData(rawData) {
  validator.assertProject('syzy');
  const stamped = validator.stamp(rawData, rawData.source || 'manual_input');

  const { text } = await callClaude({
    system: `You analyze Syzy competitors (Stellar prediction markets). Extract: feature updates, user sentiment, viral content, why users choose them, pricing. Output JSON. Never fabricate.`,
    messages: [{ role: 'user', content: JSON.stringify(stamped) }],
    maxTokens: 2048
  });

  const result = { analysis: JSON.parse(text), meta: { source: stamped.source, timestamp: stamped.timestamp, confidence: stamped.confidence } };
  writeFileSync(`${DATA_PATH}/competitor-data.json`, JSON.stringify(result, null, 2));
  return result;
}

export async function analyzeSNS(rawData) {
  const keywords = CONFIG.snsKeywords;

  const { text } = await callClaude({
    system: `You analyze SNS data for Syzy (prediction market on Stellar). Keywords: ${keywords.join(', ')}. Extract: top 10 tweets per keyword, velocity, sentiment (bullish/bearish/neutral), emerging keywords. Output JSON.`,
    messages: [{ role: 'user', content: JSON.stringify(rawData) }],
    maxTokens: 3000
  });

  const result = { keywords, analysis: JSON.parse(text), meta: { timestamp: new Date().toISOString(), confidence: 75 } };
  writeFileSync(`${DATA_PATH}/sns-data.json`, JSON.stringify(result, null, 2));
  notifier.opportunity(`Syzy SNS analysis complete. ${keywords.length} keywords tracked.`);
  return result;
}
