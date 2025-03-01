from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.sql import func
from app.database import Base

class Log(Base):
    __tablename__ = "logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=func.now(), index=True)
    level = Column(String, index=True)
    message = Column(Text)
    method = Column(String)
    path = Column(String)
    ip_address = Column(String)
    user_agent = Column(Text)
    request_id = Column(String, index=True)
    
    # Optional additional fields
    user_id = Column(Integer, nullable=True)
    additional_data = Column(Text, nullable=True) 