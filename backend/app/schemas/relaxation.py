from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class RelaxationExerciseBase(BaseModel):
    title: str
    description: str
    instructions: str
    duration_minutes: Optional[int] = None
    difficulty_level: Optional[str] = None
    tags: List[str] = []

class RelaxationExerciseCreate(RelaxationExerciseBase):
    pass

class RelaxationExerciseResponse(RelaxationExerciseBase):
    id: int
    upvotes: int
    downvotes: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

class RelaxationExerciseList(BaseModel):
    exercises: List[RelaxationExerciseResponse]

class VoteRequest(BaseModel):
    exercise_id: int = Field(..., description="ID of the relaxation exercise to vote on")
    vote_type: str = Field(..., description="Either 'upvote' or 'downvote'")

class GenerateRelaxationExerciseRequest(BaseModel):
    prompt: Optional[str] = Field(None, description="Optional specific prompt to guide the AI generation")
    count: Optional[int] = Field(5, description="Number of relaxation exercises to generate, default is 5")
    tags: Optional[List[str]] = Field(None, description="Optional specific tags to include in generation")
    difficulty: Optional[str] = Field(None, description="Optional difficulty level (beginner, intermediate, advanced)")
    duration: Optional[int] = Field(None, description="Optional target duration in minutes") 