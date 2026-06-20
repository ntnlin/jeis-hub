/**
 * API Integration Hub
 * Centralized API management with retry logic and error logging
 */

import axios from 'axios';
import { Notifier } from './notifier.js';

const notifier = new Notifier();

const API_CONFIG = {
  claude: { baseURL: 'https://api.anthropic.com', key: process.env.CLAUDE_API_KEY },
  openai: { baseURL: 'https://api.openai.com', key: process.env.OPENAI_API_KEY }
};

async function withRetry(fn, retries = 3, delayMs = 1000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const isLast = attempt === retries;
      const isRateLimit = err.response?.status === 429;

      if (isRateLimit) {
        const waitMs = (err.response?.headers?.['retry-after'] || delayMs / 1000) * 1000;
        notifier.warning(`Rate limit hit. Waiting ${waitMs / 1000}s... (attempt ${attempt}/${retries})`);
        await new Promise(r => setTimeout(r, waitMs));
      } else if (!isLast) {
        await new Promise(r => setTimeout(r, delayMs * attempt));
      } else {
        notifier.critical(`API call failed after ${retries} attempts: ${err.message}`);
        throw err;
      }
    }
  }
}

export async function apiCall(service, endpoint, options = {}) {
  const config = API_CONFIG[service];
  if (!config) throw new Error(`Unknown API service: ${service}`);

  return withRetry(async () => {
    const response = await axios({
      url: `${config.baseURL}${endpoint}`,
      method: options.method || 'GET',
      headers: { Authorization: `Bearer ${config.key}`, 'Content-Type': 'application/json', ...options.headers },
      data: options.body,
      params: options.params,
      timeout: 30000
    });
    return response.data;
  });
}

export function registerAPI(name, baseURL, keyEnvVar) {
  API_CONFIG[name] = { baseURL, key: process.env[keyEnvVar] };
  return { registered: true, name };
}
