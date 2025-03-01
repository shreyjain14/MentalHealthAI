from pydantic import BaseModel, EmailStr, Field
from app.schemas.base import TimeStampSchema
from typing import Optional
from app.schemas.user_profile import UserProfile

class UserBase(BaseModel):
    email: EmailStr
    username: str
    is_active: Optional[bool] = True
    is_superuser: Optional[bool] = False

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    password: Optional[str] = Field(None, min_length=8)
    is_active: Optional[bool] = None
    is_superuser: Optional[bool] = None

class UserInDBBase(UserBase, TimeStampSchema):
    id: int

    model_config = {"from_attributes": True}

class User(UserInDBBase):
    profile: Optional[UserProfile] = None

class UserInDB(UserInDBBase):
    hashed_password: str 