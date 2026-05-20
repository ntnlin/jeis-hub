import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    # X API — @jeivyou credentials
    BEARER_TOKEN: str = os.getenv("JEIVYOU_BEARER_TOKEN", "")
    API_KEY: str = os.getenv("JEIVYOU_API_KEY", "")
    API_SECRET: str = os.getenv("JEIVYOU_API_SECRET", "")
    ACCESS_TOKEN: str = os.getenv("JEIVYOU_ACCESS_TOKEN", "")
    ACCESS_TOKEN_SECRET: str = os.getenv("JEIVYOU_ACCESS_TOKEN_SECRET", "")
    ACCOUNT_ID: str = os.getenv("JEIVYOU_ACCOUNT_ID", "")

    # AI
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "anthropic")
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    ANTHROPIC_MODEL: str = os.getenv("ANTHROPIC_MODEL", "claude-sonnet-4-6")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    # Scan — prediction market + Solana focus
    SCAN_QUERIES: list[str] = [
        q.strip()
        for q in os.getenv(
            "JEIVYOU_SCAN_QUERIES",
            "polymarket kalshi,solana memecoin,sol degen,$SOL $ETH,prediction market crypto,sharp score,vezta,DeFAI stellar",
        ).split(",")
        if q.strip()
    ]
    LOOP_INTERVAL: int = int(os.getenv("LOOP_INTERVAL", "900"))
    DRY_RUN: bool = os.getenv("DRY_RUN", "0") == "1"

    # Safety limits (per day)
    MAX_TWEETS_DAY: int = 10
    MAX_RETWEETS_DAY: int = 10
    MAX_REPLIES_DAY: int = 100
    MAX_LIKES_DAY: int = 100
    MAX_REPLIES_HOUR: int = 25

    # Scheduler
    ACTION_DELAY_MIN: int = 2
    ACTION_DELAY_MAX: int = 15
    FOLLOW_UP_MIN: int = 5
    FOLLOW_UP_MAX: int = 30

    # Human activity cycle (New York / ET)
    ACTIVE_WINDOWS = [
        (9, 0, 13, 0),
        (15, 0, 19, 0),
        (21, 0, 0, 0),
    ]
    LOW_WINDOWS = [
        (13, 0, 15, 0),
    ]
    SLEEP_START = (0, 30)
    SLEEP_END = (8, 30)

    # Decision probabilities (updated by learning engine)
    DECISION_PROBS = {
        "ignore": 0.50,
        "like": 0.25,
        "reply": 0.17,
        "retweet": 0.08,
    }

    # Persona — @jeivyou: Web3 degen builder
    PERSONA_NAME = "jeivyou"
    PERSONA_TOPICS = [
        "polymarket", "kalshi", "solana", "prediction markets",
        "DeFAI", "Vezta", "Tasmil", "Syzy", "Web3 builder"
    ]
    TONE_RULES = {
        "banned": ["excited to announce", "thrilled to share", "love your work", "amazing project",
                   "sáo rỗng", "chung chung"],
        "allowed_slang": ["ngl", "fr fr", "lowkey", "based", "ngmi", "ser", "degen"],
        "max_sentences": 3
    }

    DB_PATH: str = os.path.join(os.path.dirname(__file__), "jeivyou.db")


cfg = Config()
