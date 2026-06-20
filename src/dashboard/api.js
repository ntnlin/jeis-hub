/**
 * Dashboard API routes
 */

import { Router } from 'express';
import { readFileSync, existsSync } from 'fs';
import { getDailyCalendar, getUpcoming } from '../calendar/eventManager.js';
import { getStats } from '../outreach/outreachTracker.js';
import { Notifier } from '../core/notifier.js';

export const apiRouter = Router();
const notifier = new Notifier();

function safeRead(path, fallback = {}) {
  try { return existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : fallback; }
  catch { return fallback; }
}

apiRouter.get('/status', (req, res) => {
  // The dashboard runs in its own process, so report persisted token totals
  // from disk rather than an in-memory session count that is always 0 here.
  const usage = safeRead('./database/token-usage.json');
  const budget = usage.budgets?.sessionBudget || 0;
  res.json({
    status: 'running',
    version: '1.0.0',
    tokensToday: usage.totals?.today || 0,
    tokensAllTime: usage.totals?.allTime || 0,
    sessionBudget: budget,
    timestamp: new Date().toISOString()
  });
});

apiRouter.get('/projects', (req, res) => {
  const projects = ['vezta', 'tasmil', 'syzy', 'setlone'].map(p => ({
    id: p,
    config: safeRead(`./config/projects/${p}.config.json`),
    metrics: safeRead('./database/metrics.json').projects?.[p] || {}
  }));
  res.json(projects);
});

apiRouter.get('/calendar/:date', (req, res) => {
  res.json(getDailyCalendar(req.params.date));
});

apiRouter.get('/calendar/upcoming/:days', (req, res) => {
  res.json(getUpcoming(parseInt(req.params.days) || 7));
});

apiRouter.get('/outreach/stats', (req, res) => {
  res.json(getStats());
});

apiRouter.get('/alerts/recent', (req, res) => {
  res.json(notifier.getRecent(20));
});

apiRouter.get('/tokens', (req, res) => {
  res.json(safeRead('./database/token-usage.json'));
});

apiRouter.get('/skills', (req, res) => {
  res.json(safeRead('./skills/index.json'));
});

apiRouter.get('/trends/:project', (req, res) => {
  const trends = safeRead('./database/trends.json');
  const project = req.params.project;
  if (!trends.projects?.[project]) return res.status(404).json({ error: 'Project not found' });
  res.json(trends.projects[project]);
});

apiRouter.get('/inbox/summary', (req, res) => {
  const today = new Date().toISOString().split('T')[0].replace(/-/g, '/');
  res.json({
    email: safeRead(`./files/inbox/email/${today}`, {}),
    telegram: safeRead(`./files/inbox/telegram/${today}`, {}),
    discord: safeRead(`./files/inbox/discord/${today}`, {}),
    date: today
  });
});
