"""
JEIVYOU — main orchestration loop.

Pipeline per tweet:
  Trend Scanner → Semantic Layer → Tweet Scorer → Context Builder
  → Decision Engine → Intent Engine → Narrative Engine
  → Content Generator → Humanizer → Noise Layer → Chaos Engine
  → Anti-AI Filter → Action Scheduler → X API Executor
  → Feedback Collector → Learning Engine → Persona Evolution

NOTE: This bot runs as a standalone Python process, separate from the Node.js hub.
Run: python main.py
Requires: pip install -r requirements.txt + .env configured
Supporting modules (core/, utils/, db/) must be built in Phase 2.
"""
import logging
import random
import signal
import sys
import time

from config import cfg
from db.storage import init_db
from utils.activity_cycle import is_active, current_session, idle_gap_seconds

from core.trend_scanner import scan
from core.semantic_layer import analyze
from core.tweet_scorer import score
from core.context_builder import build
from core.decision_engine import decide
from core.intent_engine import choose_intent
from core.narrative_engine import inject
from core.content_generator import generate
from core.humanizer import humanize
from core.noise_layer import add_noise
from core.chaos_engine import apply as chaos_apply
from core.conversation_engine import maybe_follow_up, generate_follow_up
from core.action_scheduler import schedule_action
from core.x_executor import post_reply, post_tweet, like, retweet
from core.feedback_collector import register, collect_all
from core.learning_engine import record_style, summary
from core.persona_evolution import maybe_evolve, sharpness_hint
from utils.anti_ai_filter import is_human_enough

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("jeivyou")


def _execute_reply(tweet_id: str, text: str, intent: str):
    new_id = post_reply(tweet_id, text, intent)
    if new_id and new_id != "dry_run_id":
        register(new_id, intent, "reply")


def _execute_tweet(text: str, intent: str):
    new_id = post_tweet(text, intent)
    if new_id and new_id != "dry_run_id":
        register(new_id, intent, "tweet")


def _execute_follow_up(job):
    content = generate_follow_up(job)
    if content:
        new_id = post_reply(job.tweet_id, content, "follow_up")
        if new_id and new_id != "dry_run_id":
            register(new_id, "follow_up", "reply")


def process_tweet(tweet):
    """Full pipeline for one tweet."""
    signal_data = analyze(tweet)
    score_data = score(tweet, signal_data)
    ctx = build(tweet, signal_data, score_data)

    action = decide(ctx)
    if action == "ignore":
        log.debug("ignore tweet=%s", tweet.id)
        return

    if action == "like":
        schedule_action(like, tweet_id=tweet.id)
        return

    if action == "retweet":
        schedule_action(retweet, tweet_id=tweet.id)
        return

    choose_intent(ctx)
    inject(ctx)

    hint = sharpness_hint()
    if hint:
        ctx.narrative_hint = hint + "\n" + ctx.narrative_hint

    draft = generate(ctx)
    if not draft:
        log.warning("content generation failed for tweet=%s, ignoring", tweet.id)
        return

    draft = humanize(draft)
    draft = add_noise(draft)
    ctx.draft = draft

    final = chaos_apply(ctx)
    if final is None:
        log.debug("chaos skipped action for tweet=%s", tweet.id)
        return

    if not is_human_enough(final):
        log.debug("final content rejected by anti-AI filter: %r", final)
        return

    ctx.final = final
    log.info("action=%s intent=%s content=%r tweet=%s", action, ctx.intent, final, tweet.id)

    if action == "reply":
        schedule_action(_execute_reply, tweet_id=tweet.id, text=final, intent=ctx.intent)
    else:
        schedule_action(_execute_tweet, text=final, intent=ctx.intent)

    record_style(final, [ctx.signal.topic, ctx.intent])

    if action == "reply":
        job = maybe_follow_up(ctx, tweet.id)
        if job:
            schedule_action(_execute_follow_up, delay_override=job.delay_seconds, job=job)


def run_cycle():
    """One full scan-and-process cycle."""
    session = current_session()
    if session == "sleep":
        log.info("sleep window — skipping cycle")
        return

    if session == "skip":
        log.info("random session skip")
        return

    if random.random() < 0.15:
        log.info("idle scroll — no actions this cycle")
        return

    log.info("scan start | session=%s", session)
    tweets = scan(max_per_query=15)
    log.info("fetched %d new tweets", len(tweets))

    for tweet in tweets:
        try:
            process_tweet(tweet)
        except Exception as e:
            log.error("process_tweet failed tweet=%s: %s", tweet.id, e)

    collect_all()
    maybe_evolve()
    log.info("cycle done | learning=%s", summary())


def main():
    init_db()
    log.info("JEIVYOU starting | dry_run=%s provider=%s", cfg.DRY_RUN, cfg.AI_PROVIDER)

    def _shutdown(sig, frame):
        log.info("shutting down…")
        from core.action_scheduler import shutdown
        shutdown()
        sys.exit(0)

    signal.signal(signal.SIGINT, _shutdown)
    signal.signal(signal.SIGTERM, _shutdown)

    while True:
        try:
            run_cycle()
        except Exception as e:
            log.error("cycle error: %s", e, exc_info=True)

        sleep_base = cfg.LOOP_INTERVAL
        sleep_jitter = random.randint(-120, 300)
        sleep_secs = max(300, sleep_base + sleep_jitter)
        log.info("next cycle in %.0f min", sleep_secs / 60)
        time.sleep(sleep_secs)


if __name__ == "__main__":
    main()
