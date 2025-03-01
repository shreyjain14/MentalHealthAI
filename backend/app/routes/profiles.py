from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.models.user import User
from app.models.user_profile import UserProfile
from app.schemas.user_profile import UserProfile as UserProfileSchema
from app.schemas.user_profile import UserProfileCreate, UserProfileUpdate, MoodUpdate
from app.auth.utils import get_current_active_user

router = APIRouter()

@router.get("/me", response_model=UserProfileSchema)
async def get_user_profile(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get the current user's profile"""
    # Check if profile exists
    if not current_user.profile:
        # Create an empty profile if it doesn't exist
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
        return profile
    
    return current_user.profile

@router.put("/me", response_model=UserProfileSchema)
async def update_user_profile(
    profile_update: UserProfileUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update the current user's profile"""
    # Check if profile exists
    if not current_user.profile:
        # Create a new profile with the provided data
        profile_data = profile_update.model_dump(exclude_unset=True)
        profile = UserProfile(user_id=current_user.id, **profile_data)
        db.add(profile)
        db.commit()
        db.refresh(profile)
        return profile
    
    # Update existing profile
    profile = current_user.profile
    profile_data = profile_update.model_dump(exclude_unset=True)
    
    for key, value in profile_data.items():
        setattr(profile, key, value)
    
    db.commit()
    db.refresh(profile)
    return profile

@router.put("/me/mood", response_model=UserProfileSchema)
async def update_mood(
    mood_update: MoodUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update only the current mood of the user"""
    # Check if profile exists
    if not current_user.profile:
        # Create a new profile with just the mood
        profile = UserProfile(user_id=current_user.id, current_mood=mood_update.current_mood)
        db.add(profile)
        db.commit()
        db.refresh(profile)
        return profile
    
    # Update only the mood
    profile = current_user.profile
    profile.current_mood = mood_update.current_mood
    
    db.commit()
    db.refresh(profile)
    return profile 