from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    database_url: str = "postgresql://postgres:Rishi%402201@localhost:5432/stockmaster"
    sendgrid_api_key: str = "your_sendgrid_api_key_here"
    sendgrid_from_email: str = "noreply@stockmaster.com"

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    return Settings()
