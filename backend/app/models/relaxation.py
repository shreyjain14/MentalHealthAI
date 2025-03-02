from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import JSONB
from app.database import Base

class RelaxationExercise(Base):
    __tablename__ = "relaxation_exercises"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), unique=True, nullable=False)
    description = Column(Text, nullable=False)
    instructions = Column(Text, nullable=False)
    duration_minutes = Column(Integer, nullable=True)
    difficulty_level = Column(String(50), nullable=True)  # "beginner", "intermediate", "advanced"
    tags = Column(JSONB, nullable=True)  # Store as a JSON array
    upvotes = Column(Integer, default=0, nullable=False)
    downvotes = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False) 