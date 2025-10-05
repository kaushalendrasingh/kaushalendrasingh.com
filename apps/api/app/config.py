from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl, field_validator
from typing import List

class Settings(BaseSettings):
    DATABASE_URL: str
    ADMIN_API_KEY: str
    ALLOWED_ORIGINS: str = "http://localhost:5173"

    @property
    def allowed_origins_list(self) -> List[str]:
        """Parse comma-separated origins and return as list"""
        origins = [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]
        # Add wildcard if explicitly set to "*"
        if self.ALLOWED_ORIGINS == "*":
            return ["*"]
        return origins

settings = Settings()  # reads from env
