from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime, timedelta

from app.database import get_db
from app.models.user import User
from app.models.user_profile import UserProfile
from app.models.mood_history import MoodHistory
from app.schemas.user_profile import UserProfile as UserProfileSchema
from app.schemas.user_profile import UserProfileCreate, UserProfileUpdate, MoodUpdate
from app.schemas.mood_history import MoodHistoryList, MoodHistoryResponse, MoodForecast
from app.auth.utils import get_current_active_user
from app.services.gemini_service import gemini_service

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
        
        # Record mood in history if it was set
        if profile_update.current_mood:
            mood_history_entry = MoodHistory(
                user_id=current_user.id,
                mood=profile_update.current_mood
            )
            db.add(mood_history_entry)
            db.commit()
        
        return profile
    
    # Update existing profile
    profile = current_user.profile
    profile_data = profile_update.model_dump(exclude_unset=True)
    
    # Check if mood is being updated
    mood_updated = False
    if 'current_mood' in profile_data and profile_data['current_mood'] != profile.current_mood:
        mood_updated = True
    
    for key, value in profile_data.items():
        setattr(profile, key, value)
    
    db.commit()
    db.refresh(profile)
    
    # Record mood change in history if the mood was updated
    if mood_updated:
        mood_history_entry = MoodHistory(
            user_id=current_user.id,
            mood=profile.current_mood
        )
        db.add(mood_history_entry)
        db.commit()
    
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
    else:
        # Update only the mood
        profile = current_user.profile
        profile.current_mood = mood_update.current_mood
        db.commit()
        db.refresh(profile)
    
    # Record this mood change in mood history
    mood_history_entry = MoodHistory(
        user_id=current_user.id,
        mood=mood_update.current_mood
    )
    db.add(mood_history_entry)
    db.commit()
    
    return profile

@router.get("/me/mood-history", response_model=MoodHistoryList)
async def get_mood_history(
    days: int = 7,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get the user's mood history for the specified number of days (default: 7 days)"""
    # Calculate the date threshold
    cutoff_date = datetime.now() - timedelta(days=days)
    
    # Query mood history entries after the cutoff date
    mood_entries = db.query(MoodHistory).filter(
        MoodHistory.user_id == current_user.id,
        MoodHistory.timestamp >= cutoff_date
    ).order_by(MoodHistory.timestamp.desc()).all()
    
    return MoodHistoryList(history=mood_entries)

@router.get("/me/mood-forecast", response_model=MoodForecast)
async def get_mood_forecast(
    days: int = 7,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get AI-generated mood forecast based on user's mood history"""
    # Check if user has a profile and current mood
    if not current_user.profile or not current_user.profile.current_mood:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current mood is not set in your profile. Please update your profile first."
        )
    
    # Calculate the date threshold
    cutoff_date = datetime.now() - timedelta(days=days)
    
    # Query mood history entries after the cutoff date
    mood_entries = db.query(MoodHistory).filter(
        MoodHistory.user_id == current_user.id,
        MoodHistory.timestamp >= cutoff_date
    ).order_by(MoodHistory.timestamp.desc()).all()
    
    # Convert mood entries to list of dictionaries
    mood_history = [
        {"mood": entry.mood, "timestamp": entry.timestamp}
        for entry in mood_entries
    ]
    
    # Get forecast from Gemini AI
    forecast = await gemini_service.generate_mood_forecast(
        mood_history=mood_history,
        current_mood=current_user.profile.current_mood
    )
    
    if not forecast:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate mood forecast"
        )
    
    return MoodForecast(**forecast) 