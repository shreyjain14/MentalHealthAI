from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class VirtualPetCreate(BaseModel):
    animal_type: str
    name: str

class VirtualPetMessage(BaseModel):
    message: str

class ChatMessage(BaseModel):
    id: int
    message: str
    is_user: bool
    timestamp: datetime
    
    model_config = {"from_attributes": True}

class ChatHistory(BaseModel):
    messages: List[ChatMessage]
    
    model_config = {"from_attributes": True}

class VirtualPet(BaseModel):
    id: int
    animal_type: str
    name: str
    created_at: datetime
    
    model_config = {"from_attributes": True}

class VirtualPetList(BaseModel):
    pets: List[VirtualPet]
    
    model_config = {"from_attributes": True} 