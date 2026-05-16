from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "NerveNet EEG Backend"
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "eeg_attention_db"
    DEBUG: bool = True
    MODEL_PATH: str = "models/attention_model.pkl"

    class Config:
        env_file = ".env"

settings = Settings()
