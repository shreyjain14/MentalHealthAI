from pydantic import BaseModel
from typing import Optional

class UserProfileBase(BaseModel):
    current_mood: Optional[str] = None
    primary_concerns: Optional[str] = None
    coping_strategies: Optional[str] = None

class UserProfileCreate(UserProfileBase):
    pass

class UserProfileUpdate(UserProfileBase):
    pass

class UserProfile(UserProfileBase):
    id: int
    user_id: int
    
    model_config = {"from_attributes": True}

class MoodUpdate(BaseModel):
    current_mood: str 