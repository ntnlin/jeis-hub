/**
 * Token budget monitor - tracks usage, alerts at thresholds
 */

import { readFileSync, writeFileSync } from 'fs';
import { Notifier } from './notifier.js';

const DB_PATH = './database/token-usage.json';

export class TokenMonitor {
  constructor() {
    this.db = JSON.parse(readFileSync(DB_PATH, 'utf8'));
    this.notifier = new Notifier();
    this.sessionTokens = 0;
    this.budget = this.db.budgets.sessionBudget;
    this.alertThreshold = this.db.budgets.alertAt;
    this.pauseThreshold = this.db.budgets.pauseAt;
  }

  track(usage) {
    const tokens = (usage?.input_tokens || 0) + (usage?.output_tokens || 0);
    this.sessionTokens += tokens;
    this.db.totals.allTime += tokens;
    this.db.totals.today = (this.db.totals.today || 0) + tokens;

    this.save();
    this.checkThresholds();

    return { sessionTokens: this.sessionTokens, budget: this.budget };
  }

  checkThresholds() {
    const pct = (this.sessionTokens / this.budget) * 100;

    if (pct >= 95) {
      this.notifier.alert('CRITICAL', `Token budget at ${pct.toFixed(0)}%. Pausing operations.`);
    } else if (pct >= 80) {
      this.notifier.alert('WARNING', `Token budget at ${pct.toFixed(0)}%. Reduce non-critical ops.`);
    }
  }

  isNearLimit() {
    return this.sessionTokens >= this.alertThreshold;
  }

  isPaused() {
    return this.sessionTokens >= this.pauseThreshold;
  }

  getUsagePercent() {
    return ((this.sessionTokens / this.budget) * 100).toFixed(1);
  }

  save() {
    writeFileSync(DB_PATH, JSON.stringify(this.db, null, 2));
  }
}
