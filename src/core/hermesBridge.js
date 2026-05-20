/**
 * Hermes Agent bridge.
 *
 * Keeps NousResearch/hermes-agent isolated as an external specialist runner.
 * Jei's Hub remains the source of truth for routing, dedupe, validation, and
 * storage decisions.
 */

import { execFile } from 'child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { createHash } from 'crypto';
import { fileURLToPath } from 'url';
import { Deduplicator } from './deduplicator.js';
import { DataValidator } from './dataValidator.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '../..');
const CONFIG_PATH = path.join(PROJECT_ROOT, 'config/hermes-agent.config.json');
const CACHE_PATH = path.join(PROJECT_ROOT, 'data/cache/hermes-bridge-cache.json');

const SECRET_PATTERNS = [
  /(sk-[A-Za-z0-9_-]{20,})/g,
  /(sk-ant-[A-Za-z0-9_-]{20,})/g,
  /(ghp_[A-Za-z0-9_]{20,})/g,
  /([A-Za-z0-9_-]*API[_-]?KEY["'=:\s]+)[A-Za-z0-9_.-]{8,}/gi,
  /([A-Za-z0-9_-]*TOKEN["'=:\s]+)[A-Za-z0-9_.-]{8,}/gi,
  /([A-Za-z0-9_-]*SECRET["'=:\s]+)[A-Za-z0-9_.-]{8,}/gi
];

function loadJson(filePath, fallback) {
  if (!existsSync(filePath)) return fallback;
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

function saveJson(filePath, data) {
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function hashText(text) {
  return createHash('sha256').update(text).digest('hex');
}

function truncate(text, maxChars) {
  if (!maxChars || text.length <= maxChars) return text;
  return `${text.slice(0, maxChars)}\n\n[truncated:${text.length - maxChars}_chars]`;
}

function redactSecrets(text) {
  return SECRET_PATTERNS.reduce(
    (current, pattern) => current.replace(pattern, (match, prefix) => {
      if (prefix && match.startsWith(prefix)) return `${prefix}[REDACTED]`;
      return '[REDACTED_SECRET]';
    }),
    text
  );
}

export class HermesBridge {
  constructor(config = null) {
    this.config = config || loadJson(CONFIG_PATH, {});
    this.cache = loadJson(CACHE_PATH, { entries: {} });
    this.inFlight = new Map();
    this.deduplicator = new Deduplicator();
    this.validator = new DataValidator();
  }

  shouldHandle(taskType) {
    if (!this.config.enabled) return false;
    return this.config.routing?.hermesTaskTypes?.includes(taskType) || false;
  }

  async run({ taskType = 'hermes', prompt, context = {}, allowFileMutation = false }) {
    if (!this.config.enabled) {
      return { ok: false, error: 'hermes_bridge_disabled' };
    }

    const normalizedPrompt = this.buildPrompt({ taskType, prompt, context, allowFileMutation });
    const safePrompt = this.config.guardrails?.redactSecrets
      ? redactSecrets(normalizedPrompt)
      : normalizedPrompt;
    const boundedPrompt = truncate(safePrompt, this.config.maxInputChars || 12000);
    const requestHash = hashText(JSON.stringify({
      taskType,
      prompt: boundedPrompt,
      toolsets: this.config.toolsets,
      maxTurns: this.config.maxTurns
    }));

    const cached = this.getCached(requestHash);
    if (cached) return { ...cached, cached: true };

    if (this.inFlight.has(requestHash)) {
      return this.inFlight.get(requestHash);
    }

    const runPromise = this.executeHermes(boundedPrompt, { allowFileMutation })
      .then((result) => this.postProcessResult(result, requestHash))
      .finally(() => this.inFlight.delete(requestHash));

    this.inFlight.set(requestHash, runPromise);
    return runPromise;
  }

  buildPrompt({ taskType, prompt, context, allowFileMutation }) {
    const mutationPolicy = allowFileMutation && this.config.guardrails?.allowFileMutation
      ? 'File mutation is allowed only when explicitly requested by Jei.'
      : 'Do not modify files. Return analysis, commands, or recommendations only.';

    return [
      'You are Hermes running as a bounded specialist inside Jei\'s Hub.',
      'Jei\'s Hub is the source of truth for memory, deduplication, validation, and final storage.',
      'Avoid creating persistent memories, new skills, or duplicate records unless explicitly requested.',
      'Do not call yourself recursively or ask another agent to continue this same task.',
      'Prefer concise, source-grounded output with exact next actions.',
      mutationPolicy,
      '',
      `Task type: ${taskType}`,
      `Context JSON: ${JSON.stringify(context)}`,
      '',
      `User task:\n${prompt}`
    ].join('\n');
  }

  executeHermes(prompt, { allowFileMutation }) {
    return new Promise((resolve) => {
      const args = [
        'chat',
        '-Q',
        '--query',
        prompt,
        '--source',
        'jeis-hub',
        '--toolsets',
        this.resolveToolsets(allowFileMutation),
        '--max-turns',
        String(this.config.maxTurns || 8),
        '--ignore-rules'
      ];

      if (this.config.guardrails?.disableHermesMemoryByDefault) {
        args.push('--ignore-user-config');
      }

      if (this.config.provider) args.push('--provider', this.config.provider);
      if (this.config.model) args.push('--model', this.config.model);

      const hermesHome = path.resolve(PROJECT_ROOT, this.config.stateDir || '.hermes-runtime');
      mkdirSync(hermesHome, { recursive: true });

      const env = {
        ...process.env,
        HERMES_HOME: hermesHome,
        HERMES_ACCEPT_HOOKS: '0'
      };

      execFile(this.config.command || 'hermes', args, {
        cwd: PROJECT_ROOT,
        env,
        timeout: this.config.timeoutMs || 180000,
        windowsHide: true,
        maxBuffer: 1024 * 1024 * 4
      }, (error, stdout, stderr) => {
        if (error) {
          resolve({
            ok: false,
            error: error.code === 'ENOENT' ? 'hermes_not_installed' : 'hermes_execution_failed',
            detail: stderr?.trim() || error.message
          });
          return;
        }

        resolve({
          ok: true,
          output: truncate(stdout.trim(), this.config.maxOutputChars || 12000),
          stderr: stderr?.trim() || ''
        });
      });
    });
  }

  resolveToolsets(allowFileMutation) {
    const configured = this.config.toolsets || ['web', 'search'];
    const toolsets = new Set(configured);

    if (!allowFileMutation || !this.config.guardrails?.allowFileMutation) {
      toolsets.delete('terminal');
      toolsets.delete('debugging');
    }

    return [...toolsets].join(',');
  }

  postProcessResult(result, requestHash) {
    if (!result.ok) return result;

    const stamped = this.validator.stamp({
      kind: 'hermes_agent_result',
      requestHash,
      output: result.output
    }, 'NousResearch/hermes-agent bridge', 75);

    const duplicate = this.deduplicator.check(stamped.output);
    const response = {
      ok: true,
      output: stamped.output,
      meta: {
        source: stamped.source,
        timestamp: stamped.timestamp,
        confidence: stamped.confidence,
        requestHash,
        duplicate: duplicate.isDuplicate,
        duplicateRef: duplicate.existingRef
      }
    };

    if (!duplicate.isDuplicate) {
      this.deduplicator.register(stamped.output, `hermes:${requestHash}`);
    }

    this.setCached(requestHash, response);
    return response;
  }

  getCached(requestHash) {
    const entry = this.cache.entries?.[requestHash];
    if (!entry) return null;

    const age = Date.now() - new Date(entry.cachedAt).getTime();
    if (age > (this.config.cacheTtlMs || 900000)) {
      delete this.cache.entries[requestHash];
      saveJson(CACHE_PATH, this.cache);
      return null;
    }

    return entry.value;
  }

  setCached(requestHash, value) {
    this.cache.entries[requestHash] = {
      cachedAt: new Date().toISOString(),
      value
    };
    saveJson(CACHE_PATH, this.cache);
  }
}
