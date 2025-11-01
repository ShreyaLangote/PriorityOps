"""
Configuration module for PriorityOps backend.

Centralizes all environment variable handling and configuration settings.
"""

import os
from typing import List
from pydantic import BaseSettings, Field


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # MongoDB Configuration
    mongodb_uri: str = Field(..., env="MONGODB_URI")
    mongodb_database: str = Field(default="priorityops", env="MONGODB_DATABASE")
    max_connections_count: int = Field(default=10, env="MAX_CONNECTIONS_COUNT")
    min_connections_count: int = Field(default=1, env="MIN_CONNECTIONS_COUNT")
    
    # OpenAI Configuration
    openai_api_key: str = Field(..., env="OPENAI_API_KEY")
    
    # AWS Configuration
    aws_access_key_id: str = Field(default="", env="AWS_ACCESS_KEY_ID")
    aws_secret_access_key: str = Field(default="", env="AWS_SECRET_ACCESS_KEY")
    aws_region: str = Field(default="us-east-1", env="AWS_REGION")
    
    # Application Configuration
    environment: str = Field(default="development", env="ENVIRONMENT")
    log_level: str = Field(default="INFO", env="LOG_LEVEL")
    api_version: str = Field(default="v1", env="API_VERSION")
    
    # Agent Configuration
    duplicate_similarity_threshold: float = Field(default=0.8, env="DUPLICATE_SIMILARITY_THRESHOLD")
    escalation_time_threshold_minutes: int = Field(default=60, env="ESCALATION_TIME_THRESHOLD_MINUTES")
    escalation_check_interval_minutes: int = Field(default=15, env="ESCALATION_CHECK_INTERVAL_MINUTES")
    
    # Security Configuration
    secret_key: str = Field(default="dev-secret-key", env="SECRET_KEY")
    cors_origins: str = Field(default="http://localhost:3000,http://localhost:5173", env="CORS_ORIGINS")
    
    class Config:
        env_file = ".env"
        case_sensitive = False
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Get CORS origins as a list."""
        return [origin.strip() for origin in self.cors_origins.split(",")]
    
    @property
    def is_production(self) -> bool:
        """Check if running in production environment."""
        return self.environment.lower() == "production"
    
    @property
    def is_development(self) -> bool:
        """Check if running in development environment."""
        return self.environment.lower() == "development"


# Global settings instance
settings = Settings()