from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    current_mood = Column(String(100), nullable=True)
    primary_concerns = Column(Text, nullable=True)
    coping_strategies = Column(Text, nullable=True)
    
    # Relationship with the User model
    user = relationship("User", back_populates="profile") 