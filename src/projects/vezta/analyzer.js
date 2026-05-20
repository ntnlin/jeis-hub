/**
 * Vezta - Project Analyze Module
 * Part A: User Data | Part B: Competitor Data | Part C: SNS Data
 */

import { readFileSync, writeFileSync } from 'fs';
import { callClaude } from '../../core/claudeAPI.js';
import { DataValidator } from '../../core/dataValidator.js';
import { Notifier } from '../../core/notifier.js';

const CONFIG = JSON.parse(readFileSync('./config/projects/vezta.config.json', 'utf8'));
const validator = new DataValidator();
const notifier = new Notifier();
const TODAY = new Date().toISOString().split('T')[0].replace(/-/g, '/');
const DATA_PATH = `./files/projects/vezta/${TODAY}`;

export async function analyzeUserData(rawData) {
  validator.assertProject('vezta');
  const stamped = validator.stamp(rawData, rawData.source || 'manual_input');

  const { text } = await callClaude({
    system: `You analyze Vezta (Solana prediction market) user data. Extract: DAU/WAU/MAU, retention, churn, peak hours, session duration, power user traits, growth signals, churn risk signals. Output structured JSON only. Never fabricate - if data missing, mark as null.`,
    messages: [{ role: 'user', content: JSON.stringify(stamped) }],
    maxTokens: 2048
  });

  const result = { analysis: JSON.parse(text), meta: { source: stamped.source, timestamp: stamped.timestamp, confidence: stamped.confidence } };
  writeFileSync(`${DATA_PATH}/user-data.json`, JSON.stringify(result, null, 2));
  return result;
}

export async function analyzeCompetitorData(rawData) {
  validator.assertProject('vezta');
  const stamped = validator.stamp(rawData, rawData.source || 'manual_input');

  const { text } = await callClaude({
    system: `You analyze Vezta competitors (prediction markets: Polymarket, Kalshi, others). Extract: feature updates, user sentiment on X/Discord/Reddit, whale wallet patterns, viral content last 30d, why users choose them, keyword tracking, pricing. Output structured JSON. Never fabricate.`,
    messages: [{ role: 'user', content: JSON.stringify(stamped) }],
    maxTokens: 2048
  });

  const result = { analysis: JSON.parse(text), meta: { source: stamped.source, timestamp: stamped.timestamp, confidence: stamped.confidence } };
  writeFileSync(`${DATA_PATH}/competitor-data.json`, JSON.stringify(result, null, 2));
  return result;
}

export async function analyzeSNS(rawData) {
  validator.assertProject('vezta');
  const keywords = CONFIG.snsKeywords;

  const { text } = await callClaude({
    system: `You analyze SNS data for Vezta (Solana prediction market). Keywords: ${keywords.join(', ')}. Extract: top 10 tweets per keyword, keyword velocity (growth rate), sentiment (bullish/bearish/neutral), emerging keywords. Output structured JSON. Never fabricate.`,
    messages: [{ role: 'user', content: JSON.stringify(rawData) }],
    maxTokens: 3000
  });

  const result = { keywords, analysis: JSON.parse(text), meta: { timestamp: new Date().toISOString(), confidence: 75 } };
  writeFileSync(`${DATA_PATH}/sns-data.json`, JSON.stringify(result, null, 2));
  notifier.opportunity(`Vezta SNS analysis complete. ${keywords.length} keywords tracked.`);
  return result;
}
