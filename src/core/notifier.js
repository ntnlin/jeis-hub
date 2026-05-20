/**
 * Notification system - alerts, reminders, opportunities
 */

import chalk from 'chalk';
import { writeFileSync, existsSync, readFileSync } from 'fs';

const LOG_PATH = './logs/alerts.json';
const ICONS = {
  URGENT:      '⚡',
  REMINDER:    '📅',
  OPPORTUNITY: '💡',
  WARNING:     '⚠️',
  CRITICAL:    '🔴'
};

const COLORS = {
  URGENT:      chalk.red.bold,
  REMINDER:    chalk.blue,
  OPPORTUNITY: chalk.yellow,
  WARNING:     chalk.yellow.bold,
  CRITICAL:    chalk.red.bold.bgWhite
};

export class Notifier {
  constructor() {
    this.log = existsSync(LOG_PATH) ? JSON.parse(readFileSync(LOG_PATH, 'utf8')) : [];
  }

  alert(type, message, data = null) {
    const icon = ICONS[type] || '🔔';
    const color = COLORS[type] || chalk.white;
    const entry = { type, message, data, timestamp: new Date().toISOString() };

    console.log(color(`\n${icon} [${type}] ${message}`));
    if (data) console.log(chalk.gray(JSON.stringify(data, null, 2)));

    this.log.push(entry);
    this.saveLogs();
    return entry;
  }

  urgent(msg, data)      { return this.alert('URGENT', msg, data); }
  reminder(msg, data)    { return this.alert('REMINDER', msg, data); }
  opportunity(msg, data) { return this.alert('OPPORTUNITY', msg, data); }
  warning(msg, data)     { return this.alert('WARNING', msg, data); }
  critical(msg, data)    { return this.alert('CRITICAL', msg, data); }

  saveLogs() {
    writeFileSync(LOG_PATH, JSON.stringify(this.log.slice(-1000), null, 2));
  }

  getRecent(n = 20) {
    return this.log.slice(-n);
  }
}
