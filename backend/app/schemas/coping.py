from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class CopingMethodBase(BaseModel):
    title: str
    description: str
    tags: List[str] = []

class CopingMethodCreate(CopingMethodBase):
    pass

class CopingMethodResponse(CopingMethodBase):
    id: int
    upvotes: int
    downvotes: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

class CopingMethodList(BaseModel):
    methods: List[CopingMethodResponse]

class VoteRequest(BaseModel):
    method_id: int = Field(..., description="ID of the coping method to vote on")
    vote_type: str = Field(..., description="Either 'upvote' or 'downvote'")

class GenerateCopingMethodRequest(BaseModel):
    prompt: Optional[str] = Field(None, description="Optional specific prompt to guide the AI generation")
    count: Optional[int] = Field(5, description="Number of coping methods to generate, default is 5")
    tags: Optional[List[str]] = Field(None, description="Optional specific tags to include in generation") 