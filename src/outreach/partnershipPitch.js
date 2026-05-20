/**
 * Section 6D - Partnership Pitch Generator
 */

import { writeFileSync, readFileSync, existsSync } from 'fs';
import { callClaude } from '../core/claudeAPI.js';
import { Notifier } from '../core/notifier.js';

const notifier = new Notifier();
const TODAY = new Date().toISOString().split('T')[0].replace(/-/g, '/');
const LOG_PATH = `./files/outreach/partnerships/${TODAY}/pitches.json`;

function loadLog() {
  return existsSync(LOG_PATH) ? JSON.parse(readFileSync(LOG_PATH, 'utf8')) : [];
}

export async function generatePitch(opportunity, project) {
  const { text } = await callClaude({
    system: `Generate a partnership pitch from Jei's project (${project}) to ${opportunity.name}. Structure:\n1. Why we want them (specific reason, not generic)\n2. What we offer (specific value, data if possible)\n3. What we want (specific ask)\nAlso generate pitch deck outline if needed.\nOutput JSON: { whyWeThem, whatWeOffer, whatWeWant, pitchDeckOutline, channel, tone: "formal" }.`,
    messages: [{ role: 'user', content: `Opportunity: ${JSON.stringify(opportunity)}\nOur project: ${project}` }],
    maxTokens: 1024
  });

  const pitch = {
    id: `pitch_${Date.now()}`,
    project,
    partner: opportunity.name,
    status: 'identified',
    pitch: JSON.parse(text),
    createdAt: new Date().toISOString(),
    attempts: []
  };

  const log = loadLog();
  log.push(pitch);
  writeFileSync(LOG_PATH, JSON.stringify(log, null, 2));
  notifier.opportunity(`Partnership pitch ready: ${project} × ${opportunity.name}`);
  return pitch;
}

export function identifyOpportunities(snsData, competitorData, project) {
  const opportunities = [];

  if (snsData?.analysis) {
    opportunities.push({ source: 'sns_trend', name: 'trending_partner_TBD', reason: 'High keyword overlap detected' });
  }
  if (competitorData?.analysis) {
    opportunities.push({ source: 'competitor_gap', name: 'competitor_integration_TBD', reason: 'Competitor gap identified' });
  }

  return { project, opportunities, identifiedAt: new Date().toISOString() };
}
