from datetime import datetime
from sqlalchemy import Column, DateTime
from app.database import Base

class TimeStampMixin:
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow) 