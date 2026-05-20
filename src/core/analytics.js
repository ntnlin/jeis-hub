/**
 * Section 13A - Analytics Dashboard data provider
 * Section 13B - A/B Testing System
 * Section 13C - Sentiment Analysis
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { callClaude } from './claudeAPI.js';

const DB = './database';

export function getProjectMetrics(project) {
  const metrics = JSON.parse(readFileSync(`${DB}/metrics.json`, 'utf8'));
  const trends = JSON.parse(readFileSync(`${DB}/trends.json`, 'utf8'));
  return {
    project,
    metrics: metrics.projects[project],
    trends: trends.projects[project],
    timestamp: new Date().toISOString()
  };
}

export function compareProjects() {
  const metrics = JSON.parse(readFileSync(`${DB}/metrics.json`, 'utf8'));
  return {
    comparison: Object.entries(metrics.projects).map(([project, data]) => ({ project, ...data })),
    generatedAt: new Date().toISOString()
  };
}

export async function generateABVariants(content, context = '') {
  const { callClaudeBatch } = await import('./claudeAPI.js');
  const [varA, varB] = await Promise.all([
    callClaude({ system: `Generate content variant A. ${context} Be direct and data-driven.`, messages: [{ role: 'user', content }], maxTokens: 512 }),
    callClaude({ system: `Generate content variant B. ${context} Be conversational and story-driven.`, messages: [{ role: 'user', content }], maxTokens: 512 })
  ]);

  const test = {
    id: `ab_${Date.now()}`,
    original: content,
    variantA: { content: varA.text, style: 'data-driven', performance: null },
    variantB: { content: varB.text, style: 'story-driven', performance: null },
    winner: null,
    createdAt: new Date().toISOString(),
    status: 'running'
  };

  const path = `${DB}/ab-tests.json`;
  const tests = existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : [];
  tests.push(test);
  writeFileSync(path, JSON.stringify(tests, null, 2));
  return test;
}

export function recordABResult(testId, winner, metricsA, metricsB) {
  const path = `${DB}/ab-tests.json`;
  if (!existsSync(path)) return null;
  const tests = JSON.parse(readFileSync(path, 'utf8'));
  const test = tests.find(t => t.id === testId);
  if (!test) return null;
  test.winner = winner;
  test.variantA.performance = metricsA;
  test.variantB.performance = metricsB;
  test.status = 'completed';
  test.completedAt = new Date().toISOString();
  writeFileSync(path, JSON.stringify(tests, null, 2));
  return test;
}

export async function analyzeSentiment(keyword, project) {
  const trends = JSON.parse(readFileSync(`${DB}/trends.json`, 'utf8'));
  const keywordData = trends.projects[project]?.keywords[keyword];
  if (!keywordData) return { error: 'keyword_not_found', keyword, project };

  return {
    keyword, project,
    sentiment: keywordData.sentiment,
    sentimentScore: keywordData.sentimentScore,
    trending: keywordData.trending,
    velocity: keywordData.velocity,
    timestamp: new Date().toISOString()
  };
}
