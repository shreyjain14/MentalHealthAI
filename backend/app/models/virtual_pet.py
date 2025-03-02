from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class VirtualPet(Base):
    __tablename__ = "virtual_pets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    animal_type = Column(String(50), nullable=False)  # e.g., "cat", "dog", "rabbit"
    name = Column(String(100), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationship with the User model
    user = relationship("User", backref="virtual_pets")
    # Relationship with chat messages
    chat_messages = relationship("VirtualPetChat", back_populates="pet", cascade="all, delete-orphan")

class VirtualPetChat(Base):
    __tablename__ = "virtual_pet_chats"

    id = Column(Integer, primary_key=True, index=True)
    pet_id = Column(Integer, ForeignKey("virtual_pets.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    message = Column(Text, nullable=False)
    is_user = Column(Boolean, nullable=False, default=True)  # True if message is from user, False if from pet
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    pet = relationship("VirtualPet", back_populates="chat_messages")
    user = relationship("User", backref="pet_chat_messages") 