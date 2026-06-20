/**
 * Master Agent - Central autonomous brain for Jei's Hub
 */

import Anthropic from '@anthropic-ai/sdk';
import { tokenMonitor } from './tokenMonitor.js';
import { FileHandler } from './fileHandler.js';
import { Notifier } from './notifier.js';
import { SkillEngine } from './skillEngine.js';
import { DataValidator } from './dataValidator.js';
import { HermesBridge } from './hermesBridge.js';

const client = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });

export class MasterAgent {
  constructor() {
    this.tokenMonitor = tokenMonitor;
    this.fileHandler = new FileHandler();
    this.notifier = new Notifier();
    this.skillEngine = new SkillEngine();
    this.dataValidator = new DataValidator();
    this.hermesBridge = new HermesBridge();
    this.sessionId = `session_${Date.now()}`;
  }

  async route(input) {
    const { type, data, context } = input;

    if (this.tokenMonitor.isNearLimit()) {
      this.notifier.alert('WARNING', 'Token budget at 80%. Pausing non-critical ops.');
      return { output: null, paused: true, reason: 'token_budget_near_limit' };
    }

    if (this.hermesBridge.shouldHandle(type)) {
      const prompt = Array.isArray(data) ? data.join(' ') : (typeof data === 'string' ? data : JSON.stringify(data));
      const result = await this.hermesBridge.run({
        taskType: type,
        prompt,
        context: context || {},
        allowFileMutation: Boolean(context?.allowFileMutation)
      });

      return {
        output: result.ok ? result.output : `Hermes bridge error: ${result.error}${result.detail ? `\n${result.detail}` : ''}`,
        meta: result.meta || null
      };
    }

    const skill = this.skillEngine.loadFor(type);
    const validated = this.dataValidator.validate(data);

    if (!validated.ok) {
      this.notifier.alert('CRITICAL', `Data integrity fail: ${validated.reason}`);
      return { output: null, error: 'data_validation_failed', reason: validated.reason };
    }

    const result = await this.execute(type, data, context, skill);

    await this.skillEngine.learnFromResult(type, result);
    return result;
  }

  async execute(type, data, context, skill) {
    const systemPrompt = skill?.systemPrompt || this.defaultSystemPrompt();
    const userMessage = this.buildMessage(type, data, context);

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: [{ type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: userMessage }]
    });

    this.tokenMonitor.track(response.usage);
    const textBlock = response.content.find(b => b.type === 'text');
    return { output: textBlock?.text ?? '', usage: response.usage };
  }

  buildMessage(type, data, context) {
    return `Task: ${type}\nContext: ${JSON.stringify(context)}\nData: ${JSON.stringify(data)}`;
  }

  defaultSystemPrompt() {
    return `You are Jei's autonomous second brain. Never fabricate data; when data is missing, say so. Projects: Vezta (Solana prediction), Tasmil (DeFAI ONLY - NOT RWA), Syzy (Stellar prediction), Setlone (TBD). Tones: degen (Gen-Z crypto, punchy), casual (friendly direct), formal (professional BD). Never: sáo rỗng, chung chung, bịa, shill, sượng.`;
  }

  async handleUpload(filePath) {
    const detected = this.fileHandler.detectType(filePath);
    const suggestedPath = this.fileHandler.suggestPath(detected);

    console.log(`Detected: ${detected.type}\nSuggested path: ${suggestedPath}\nConfirm? (y/n/custom-path)`);
    return { detected, suggestedPath };
  }
}
