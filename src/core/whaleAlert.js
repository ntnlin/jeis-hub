/**
 * Section 13D - Whale Alert System (Vezta-specific)
 * Monitor large wallet movements, volume spikes, whale behavior
 */

import { writeFileSync, readFileSync, existsSync } from 'fs';
import { Notifier } from './notifier.js';
import { callClaude } from './claudeAPI.js';

const notifier = new Notifier();
const WHALE_DB = './database/whale-alerts.json';

function loadDB() {
  return existsSync(WHALE_DB) ? JSON.parse(readFileSync(WHALE_DB, 'utf8')) : { alerts: [], patterns: [] };
}

export function detectVolumeSpike(currentVolume, baselineVolume, threshold = 2.0) {
  const multiplier = currentVolume / baselineVolume;
  if (multiplier >= threshold) {
    const alert = {
      id: `whale_${Date.now()}`,
      type: 'volume_spike',
      project: 'vezta',
      multiplier: multiplier.toFixed(2),
      currentVolume,
      baselineVolume,
      detectedAt: new Date().toISOString(),
      confidence: 90,
      source: 'on_chain_data'
    };

    const db = loadDB();
    db.alerts.push(alert);
    writeFileSync(WHALE_DB, JSON.stringify(db, null, 2));
    notifier.urgent(`🐳 VEZTA WHALE ALERT: Volume ${multiplier.toFixed(1)}x spike detected`);
    return alert;
  }
  return null;
}

export async function analyzeWhaleWallet(walletAddress, transactions) {
  const { text } = await callClaude({
    system: `Analyze this whale wallet activity on Vezta (Solana prediction market). Extract: trading patterns, prediction accuracy, volume patterns, risk behavior, likely next moves. Never fabricate - only analyze provided data. Output JSON.`,
    messages: [{ role: 'user', content: `Wallet: ${walletAddress}\nTransactions: ${JSON.stringify(transactions)}` }],
    maxTokens: 1024
  });

  const analysis = JSON.parse(text);
  const db = loadDB();
  db.patterns.push({ wallet: walletAddress, ...analysis, analyzedAt: new Date().toISOString() });
  writeFileSync(WHALE_DB, JSON.stringify(db, null, 2));
  return analysis;
}

export function getRecentAlerts(n = 10) {
  return loadDB().alerts.slice(-n);
}
