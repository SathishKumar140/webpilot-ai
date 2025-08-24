from sqlalchemy import create_engine, Column, Integer, String, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.dialects.postgresql import JSONB # Import JSONB for PostgreSQL
import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@db:5432/agent_db")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Run(Base):
    __tablename__ = "runs"

    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, index=True)
    instruction = Column(String, index=True)
    logs = Column(Text)
    video_url = Column(String, nullable=True)

class PentestRun(Base):
    __tablename__ = "pentest_runs"

    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, index=True)
    instruction = Column(String, index=True)
    report = Column(JSONB)
    video_url = Column(String, nullable=True)
    screenshot = Column(Text, nullable=True)

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
