/**
 * Section 13F - Export Functionality
 * PDF reports, investor decks, data tables, scheduled reports
 */

import { writeFileSync, readFileSync } from 'fs';
import { callClaude } from './claudeAPI.js';

export async function generateReport(type, data, options = {}) {
  const { project, period = 'monthly', format = 'markdown' } = options;

  const templates = {
    project: `Generate a ${period} project report for ${project}. Include: performance metrics, growth highlights, challenges, next steps. Format: ${format}. Professional, data-driven, no fabrication.`,
    investor: `Generate an investor update for ${project}. Include: key metrics, growth trajectory, recent wins, upcoming milestones. Format: ${format}. Crisp, confident, evidence-based.`,
    outreach: `Summarize BD and partnership activity. Include: total outreach, conversion rates, active partnerships, pipeline. Format: ${format}.`
  };

  const { text } = await callClaude({
    system: templates[type] || templates.project,
    messages: [{ role: 'user', content: JSON.stringify(data) }],
    maxTokens: 4096
  });

  const fileName = `./files/personal/misc/report-${type}-${project || 'hub'}-${Date.now()}.md`;
  writeFileSync(fileName, text);
  return { path: fileName, content: text, type, project, generatedAt: new Date().toISOString() };
}

export async function generateInvestorDeck(project, metrics, milestones) {
  const { text } = await callClaude({
    system: `Generate a structured investor pitch deck outline for ${project}. Sections: problem, solution, traction (use provided metrics), team, roadmap (use milestones), ask. Output markdown with slide structure. Never fabricate metrics.`,
    messages: [{ role: 'user', content: `Project: ${project}\nMetrics: ${JSON.stringify(metrics)}\nMilestones: ${JSON.stringify(milestones)}` }],
    maxTokens: 4096
  });

  const fileName = `./files/personal/misc/investor-deck-${project}-${Date.now()}.md`;
  writeFileSync(fileName, text);
  return { path: fileName, project, generatedAt: new Date().toISOString() };
}

export function scheduleReport(type, project, frequency = 'weekly') {
  const schedule = { type, project, frequency, scheduledAt: new Date().toISOString(), nextRun: null };
  const freqDays = { weekly: 7, monthly: 30, daily: 1 };
  const next = new Date();
  next.setDate(next.getDate() + (freqDays[frequency] || 7));
  schedule.nextRun = next.toISOString();
  return schedule;
}
