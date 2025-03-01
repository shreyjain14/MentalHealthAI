from datetime import datetime
from pydantic import BaseModel, ConfigDict

class TimeStampSchema(BaseModel):
    created_at: datetime | None = None
    updated_at: datetime | None = None
    
    model_config = ConfigDict(from_attributes=True) 