from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    STRIPE_SECRET_KEY: str = ""

    LLM_API_KEY: str = ""
    LLM_MODEL: str = "llama-3.3-70b-versatile"
    LLM_PROVIDER: str = "groq"

    COLD_START_THRESHOLD: int = 3
    RECOMMENDATION_COUNT: int = 10
    AUTO_RETRAIN_THRESHOLD: int = 10

    model_config = {"env_file": ".env"}

settings = Settings()
