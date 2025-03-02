from pydantic import BaseModel
from datetime import datetime
from typing import List

class MoodHistoryBase(BaseModel):
    mood: str

class MoodHistoryCreate(MoodHistoryBase):
    pass

class MoodHistory(MoodHistoryBase):
    id: int
    user_id: int
    timestamp: datetime
    
    model_config = {"from_attributes": True}

class MoodHistoryResponse(BaseModel):
    mood: str
    timestamp: datetime
    
    model_config = {"from_attributes": True}

class MoodHistoryList(BaseModel):
    history: List[MoodHistoryResponse] 