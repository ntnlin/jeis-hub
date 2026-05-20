/**
 * Jei's Hub v1.0 - Main Entry Point
 * Autonomous AI second brain for Web3 operator Jei (@jeivyou / @lindegen)
 */

import dotenv from 'dotenv';
import readline from 'readline';
import chalk from 'chalk';
import { MasterAgent } from './src/core/agent.js';
import { TokenMonitor } from './src/core/tokenMonitor.js';
import { Notifier } from './src/core/notifier.js';

dotenv.config();

const agent = new MasterAgent();
const tokenMonitor = new TokenMonitor();
const notifier = new Notifier();

const BANNER = `
${chalk.bold.white('╔══════════════════════════════════════════╗')}
${chalk.bold.white('║')}     ${chalk.bold.cyan("JEI'S HUB")} ${chalk.gray('v1.0')} · ${chalk.gray('Autonomous Brain')}    ${chalk.bold.white('║')}
${chalk.bold.white('║')}     ${chalk.gray('Projects: Vezta · Tasmil · Syzy · Setlone')} ${chalk.bold.white('║')}
${chalk.bold.white('║')}     ${chalk.gray('Accounts: @jeivyou · @janerebos')}          ${chalk.bold.white('║')}
${chalk.bold.white('╚══════════════════════════════════════════╝')}
`;

const COMMANDS = {
  '/help':     'Show available commands',
  '/status':   'System status and token usage',
  '/projects': 'List all projects',
  '/tweet [account] [topic]': 'Generate tweet in 3 tones',
  '/reply':    'Generate reply options (paste screenshot text)',
  '/analyze [project]': 'Analyze project data',
  '/strategy [project]': 'Generate growth strategy',
  '/bd [target]': 'Generate BD outreach',
  '/calendar [date]': 'View calendar for date',
  '/quit':     'Exit hub'
};

async function handleCommand(input) {
  const [cmd, ...args] = input.trim().split(' ');

  switch (cmd) {
    case '/help':
      console.log('\n' + chalk.bold('Available commands:'));
      Object.entries(COMMANDS).forEach(([c, d]) => console.log(`  ${chalk.cyan(c)} - ${chalk.gray(d)}`));
      break;

    case '/status':
      console.log(chalk.bold('\nSystem Status:'));
      console.log(`  Token usage: ${chalk.yellow(tokenMonitor.getUsagePercent() + '%')}`);
      console.log(`  Session tokens: ${tokenMonitor.sessionTokens.toLocaleString()}`);
      console.log(`  Budget: ${tokenMonitor.budget.toLocaleString()}`);
      break;

    case '/projects':
      console.log(chalk.bold('\nProjects:'));
      ['vezta', 'tasmil', 'syzy', 'setlone'].forEach(p => {
        const icon = p === 'setlone' ? '⚪' : '🟢';
        const tag = p === 'tasmil' ? chalk.red(' [DeFAI ONLY]') : '';
        console.log(`  ${icon} ${chalk.white(p)}${tag}`);
      });
      break;

    case '/tweet':
      const [account, ...topicParts] = args;
      const topic = topicParts.join(' ');
      if (!account || !topic) { console.log(chalk.red('Usage: /tweet [jeivyou|janerebos] [topic]')); break; }
      console.log(chalk.yellow('\nGenerating tweet in 3 tones...'));
      const { generate3Tones } = await import('./src/core/claudeAPI.js');
      const tones = await generate3Tones(topic, `@${account} Web3 account`);
      console.log(chalk.bold('\n📝 DEGEN:'), tones.degen);
      console.log(chalk.bold('\n💬 CASUAL:'), tones.casual);
      console.log(chalk.bold('\n🤝 FORMAL:'), tones.formal);
      break;

    case '/quit':
    case '/exit':
      console.log(chalk.gray('\nShutting down Jei\'s Hub... 👋\n'));
      process.exit(0);

    default:
      const result = await agent.route({ type: cmd.replace('/', ''), data: args, context: {} });
      if (result?.output) console.log('\n' + result.output);
      else console.log(chalk.gray('Command processed.'));
  }
}

async function startCLI() {
  console.log(BANNER);
  console.log(chalk.gray('  Type /help for commands | /quit to exit\n'));

  if (!process.env.CLAUDE_API_KEY) {
    notifier.alert('WARNING', 'CLAUDE_API_KEY not set. Add to .env file before using AI features.');
  }

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, prompt: chalk.cyan('hub> ') });
  rl.prompt();

  rl.on('line', async (line) => {
    const input = line.trim();
    if (!input) { rl.prompt(); return; }

    try {
      await handleCommand(input);
    } catch (err) {
      notifier.critical(`Command error: ${err.message}`);
    }
    rl.prompt();
  });

  rl.on('close', () => { console.log(chalk.gray('\nGoodbye.\n')); process.exit(0); });
}

if (process.argv[2] === '--server') {
  const { default: server } = await import('./src/dashboard/server.js');
} else {
  await startCLI();
}
