import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    # X API — @janerebos credentials
    BEARER_TOKEN: str = os.getenv("JANEREBOS_BEARER_TOKEN", "")
    API_KEY: str = os.getenv("JANEREBOS_API_KEY", "")
    API_SECRET: str = os.getenv("JANEREBOS_API_SECRET", "")
    ACCESS_TOKEN: str = os.getenv("JANEREBOS_ACCESS_TOKEN", "")
    ACCESS_TOKEN_SECRET: str = os.getenv("JANEREBOS_ACCESS_TOKEN_SECRET", "")
    ACCOUNT_ID: str = os.getenv("JANEREBOS_ACCOUNT_ID", "")

    # AI
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "anthropic")
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    ANTHROPIC_MODEL: str = os.getenv("ANTHROPIC_MODEL", "claude-sonnet-4-6")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    # Scan — Jei defines persona and queries; defaults are placeholder
    SCAN_QUERIES: list[str] = [
        q.strip()
        for q in os.getenv(
            "JANEREBOS_SCAN_QUERIES",
            "web3,crypto,solana,stellar",  # UPDATE when Jei defines @janerebos persona
        ).split(",")
        if q.strip()
    ]
    LOOP_INTERVAL: int = int(os.getenv("LOOP_INTERVAL", "900"))
    DRY_RUN: bool = os.getenv("DRY_RUN", "1") == "1"  # default dry-run until persona defined

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

    # Human activity cycle (New York / ET) — same as @jeivyou
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

    # Decision probabilities
    DECISION_PROBS = {
        "ignore": 0.50,
        "like": 0.25,
        "reply": 0.17,
        "retweet": 0.08,
    }

    # Persona — @janerebos: TBD by Jei
    # TODO: Update PERSONA_NAME description and PERSONA_TOPICS when Jei defines this account
    PERSONA_NAME = "janerebos"
    PERSONA_TOPICS = []  # Jei defines — update config/accounts/janerebos.config.json
    TONE_RULES = {
        "banned": ["excited to announce", "thrilled to share", "love your work", "amazing project",
                   "sáo rỗng", "chung chung"],
        "allowed_slang": ["ngl", "fr fr", "lowkey", "based"],
        "max_sentences": 3
    }

    DB_PATH: str = os.path.join(os.path.dirname(__file__), "janerebos.db")


cfg = Config()
