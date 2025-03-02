from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class ResourceLink(Base):
    __tablename__ = "resource_links"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    domain = Column(String(255), nullable=False, index=True)
    path = Column(Text, nullable=True)
    title = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    upvotes = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationship with the User model
    user = relationship("User", backref="resource_links") 