from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta

from app.database import get_db
from app.models.user import User
from app.models.virtual_pet import VirtualPet, VirtualPetChat
from app.schemas.virtual_pet import (
    VirtualPetCreate,
    VirtualPet as VirtualPetSchema,
    VirtualPetList,
    VirtualPetMessage,
    ChatMessage,
    ChatHistory
)
from app.auth.utils import get_current_active_user
from app.services.gemini_service import gemini_service

router = APIRouter()

@router.post("/create", response_model=VirtualPetSchema)
async def create_virtual_pet(
    pet_data: VirtualPetCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new virtual support animal"""
    # Check if user already has a pet with this name
    existing_pet = db.query(VirtualPet).filter(
        VirtualPet.user_id == current_user.id,
        VirtualPet.name == pet_data.name
    ).first()
    
    if existing_pet:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"You already have a pet named {pet_data.name}"
        )
    
    # Create new pet
    pet = VirtualPet(
        user_id=current_user.id,
        animal_type=pet_data.animal_type.lower(),
        name=pet_data.name
    )
    db.add(pet)
    db.commit()
    db.refresh(pet)
    
    return pet

@router.get("/list", response_model=VirtualPetList)
async def list_virtual_pets(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get list of user's virtual pets"""
    pets = db.query(VirtualPet).filter(
        VirtualPet.user_id == current_user.id
    ).all()
    
    return VirtualPetList(pets=pets)

@router.get("/{pet_id}/chat-history", response_model=ChatHistory)
async def get_chat_history(
    pet_id: int,
    limit: int = 50,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get chat history with a virtual pet"""
    # Verify pet exists and belongs to user
    pet = db.query(VirtualPet).filter(
        VirtualPet.id == pet_id,
        VirtualPet.user_id == current_user.id
    ).first()
    
    if not pet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Virtual pet not found"
        )
    
    # Get chat messages
    messages = db.query(VirtualPetChat).filter(
        VirtualPetChat.pet_id == pet_id
    ).order_by(
        VirtualPetChat.timestamp.desc()
    ).limit(limit).all()
    
    # Reverse to get chronological order
    messages.reverse()
    
    return ChatHistory(messages=messages)

@router.post("/{pet_id}/chat", response_model=ChatMessage)
async def chat_with_pet(
    pet_id: int,
    message: VirtualPetMessage,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Send a message to a virtual pet and get their response"""
    # Verify pet exists and belongs to user
    pet = db.query(VirtualPet).filter(
        VirtualPet.id == pet_id,
        VirtualPet.user_id == current_user.id
    ).first()
    
    if not pet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Virtual pet not found"
        )
    
    # Get recent chat history for context
    recent_messages = db.query(VirtualPetChat).filter(
        VirtualPetChat.pet_id == pet_id
    ).order_by(
        VirtualPetChat.timestamp.desc()
    ).limit(5).all()
    
    chat_history = [
        {
            "message": msg.message,
            "is_user": msg.is_user,
            "timestamp": msg.timestamp
        }
        for msg in reversed(recent_messages)
    ]
    
    # Get user's current mood if available
    user_mood = current_user.profile.current_mood if current_user.profile else None
    
    # Save user's message
    user_message = VirtualPetChat(
        pet_id=pet_id,
        user_id=current_user.id,
        message=message.message,
        is_user=True
    )
    db.add(user_message)
    db.commit()
    db.refresh(user_message)
    
    # Generate pet's response
    try:
        pet_response = await gemini_service.generate_pet_response(
            animal_type=pet.animal_type,
            pet_name=pet.name,
            user_message=message.message,
            chat_history=chat_history,
            user_mood=user_mood
        )
        
        # Save pet's response
        pet_message = VirtualPetChat(
            pet_id=pet_id,
            user_id=current_user.id,
            message=pet_response,
            is_user=False
        )
        db.add(pet_message)
        db.commit()
        db.refresh(pet_message)
        
        return pet_message
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        ) 