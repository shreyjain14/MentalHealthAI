from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class ChatMessageBase(BaseModel):
    message: str

class ChatMessageCreate(ChatMessageBase):
    pass

class ChatResponse(BaseModel):
    response: str

class ChatMessage(ChatMessageBase):
    id: int
    user_id: int
    response: Optional[str] = None
    created_at: datetime
    
    model_config = {"from_attributes": True}

class ChatHistory(BaseModel):
    messages: List[ChatMessage]

class WebSocketChatRequest(BaseModel):
    message: str
    system_prompt: Optional[str] = None
    temperature: Optional[float] = None
    top_p: Optional[float] = None
    max_tokens: Optional[int] = None 