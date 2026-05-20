# @jeivyou X Bot

Autonomous Python bot for @jeivyou. Runs independently from the Node.js hub.

## Architecture

```
main.py           — orchestration loop (scan → decide → generate → post)
config.py         — all settings, persona, rate limits, decision probabilities
requirements.txt  — Python dependencies
.env.example      — environment variable template

core/             — BUILD IN PHASE 2
  trend_scanner.py     scan X for relevant tweets
  semantic_layer.py    analyze tweet signals
  tweet_scorer.py      score relevance and quality
  context_builder.py   build full context object
  decision_engine.py   ignore / like / retweet / reply
  intent_engine.py     choose reply intent
  narrative_engine.py  inject persona narrative
  content_generator.py generate tweet content via Claude
  humanizer.py         make content sound human
  noise_layer.py       add natural variation
  chaos_engine.py      random skip/mutate for unpredictability
  conversation_engine.py  handle follow-up replies
  action_scheduler.py  schedule with human-like delays
  x_executor.py        call X API
  feedback_collector.py  collect engagement metrics
  learning_engine.py   record style, avoid repetition
  persona_evolution.py evolve tone over time

utils/            — BUILD IN PHASE 2
  activity_cycle.py    Eastern Time human schedule (active/low/sleep)
  anti_ai_filter.py    reject outputs that read as AI-generated

db/               — BUILD IN PHASE 2
  storage.py           SQLite init + queries (jeivyou.db)
```

## Tone rules (hard-coded in persona)

- DEGEN only — 1-3 sentences, Gen-Z crypto slang
- NEVER: "excited to announce", "love your work", generic praise
- NEVER: sáo rỗng, chung chung, bịa, shill without context
- Decision probabilities: ignore 50%, like 25%, reply 17%, retweet 8%

## Setup

```bash
cd src/accounts/jeivyou/bot
pip install -r requirements.txt
cp .env.example .env
# Fill in X API keys + ANTHROPIC_API_KEY
# Set DRY_RUN=1 to test without posting

python main.py
```

## Rate limits

- Tweets: 10/day
- Replies: 100/day (25/hour)
- Likes: 100/day
- Retweets: 10/day
- Loop interval: 15 min (randomized ±5 min)
- Human schedule: active 9am-1pm, 3pm-7pm, 9pm-midnight ET
