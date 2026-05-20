/**
 * Event Manager - CRUD for calendar entries
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { Notifier } from '../core/notifier.js';

const notifier = new Notifier();
const CAL_PATH = './files/calendar';

function getPath(date) {
  return `${CAL_PATH}/${date.replace(/-/g, '/')}-schedule.json`;
}

export function getEvents(date) {
  const path = getPath(date);
  if (!existsSync(path)) return { date, entries: [] };
  return JSON.parse(readFileSync(path, 'utf8'));
}

export function updateEvent(date, eventId, updates) {
  const path = getPath(date);
  if (!existsSync(path)) return null;

  const data = JSON.parse(readFileSync(path, 'utf8'));
  const idx = data.entries.findIndex(e => e.id === eventId);
  if (idx === -1) return null;

  data.entries[idx] = { ...data.entries[idx], ...updates, updatedAt: new Date().toISOString() };
  writeFileSync(path, JSON.stringify(data, null, 2));
  return data.entries[idx];
}

export function deleteEvent(date, eventId) {
  const path = getPath(date);
  if (!existsSync(path)) return false;

  const data = JSON.parse(readFileSync(path, 'utf8'));
  data.entries = data.entries.filter(e => e.id !== eventId);
  writeFileSync(path, JSON.stringify(data, null, 2));
  return true;
}

export function getUpcoming(daysAhead = 7) {
  const upcoming = [];
  for (let i = 0; i < daysAhead; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const date = d.toISOString().split('T')[0];
    const data = getEvents(date);
    upcoming.push(...data.entries.map(e => ({ ...e, date })));
  }
  return upcoming.sort((a, b) => new Date(a.date) - new Date(b.date));
}

export function getDailyCalendar(date) {
  const schedule = getEvents(date);
  const keyPath = `${CAL_PATH}/${date.replace(/-/g, '/')}-keywords.json`;
  const keywords = existsSync(keyPath) ? JSON.parse(readFileSync(keyPath, 'utf8')) : null;

  return {
    date,
    schedule: schedule.entries,
    keywords,
    tasksDueToday: schedule.entries.filter(e => e.type === 'DEADLINE'),
    meetings: schedule.entries.filter(e => e.type === 'MEETING'),
    content: schedule.entries.filter(e => e.type === 'CONTENT')
  };
}
