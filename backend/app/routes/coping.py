from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from typing import List, Optional, Dict, Any
from app.database import get_db
from app.models.coping import CopingMethod
from app.schemas.coping import (
    CopingMethodResponse, 
    CopingMethodList, 
    CopingMethodCreate, 
    VoteRequest,
    GenerateCopingMethodRequest
)
from app.services.gemini_service import gemini_service
from app.auth.utils import get_current_user
from app.models.user import User
from app.logger import get_logger
from pydantic import BaseModel, Field

logger = get_logger(__name__)
router = APIRouter(tags=["coping"])

@router.post("/auto-generate", response_model=CopingMethodList)
async def generate_coping_methods(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generate new coping methods using AI and save them to the database without user input"""
    
    # Get existing titles to avoid duplicates
    existing_titles = [title[0] for title in db.query(CopingMethod.title).all()]
    
    # Generate new coping methods using Gemini API with default values
    generated_methods = await gemini_service.generate_coping_methods(
        existing_titles=existing_titles,
        count=5,  # Default to 5 coping methods
        prompt_addition=None,
        tags=None
    )
    
    if not generated_methods:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate coping methods"
        )
    
    # Save the generated methods to the database
    saved_methods = []
    for method in generated_methods:
        try:
            # Check if the title already exists (to be extra safe)
            existing = db.query(CopingMethod).filter(
                func.lower(CopingMethod.title) == func.lower(method["title"])
            ).first()
            
            if existing:
                continue
                
            new_method = CopingMethod(
                title=method["title"],
                description=method["description"],
                tags=method["tags"],
                upvotes=0,
                downvotes=0
            )
            db.add(new_method)
            db.commit()
            db.refresh(new_method)
            saved_methods.append(new_method)
        except Exception as e:
            logger.error(f"Error saving coping method: {str(e)}")
            db.rollback()
    
    return CopingMethodList(methods=saved_methods)

@router.get("/list", response_model=CopingMethodList)
async def list_coping_methods(
    skip: int = 0, 
    limit: int = 20,
    sort_by: str = "created_at",  # Options: created_at, upvotes, downvotes
    order: str = "desc",
    tag: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """Get a list of coping methods with pagination and sorting options"""
    
    query = db.query(CopingMethod)
    
    # Filter by tag if provided
    if tag:
        query = query.filter(CopingMethod.tags.contains([tag]))
    
    # Apply sorting
    if sort_by == "upvotes":
        query = query.order_by(desc(CopingMethod.upvotes) if order == "desc" else CopingMethod.upvotes)
    elif sort_by == "downvotes":
        query = query.order_by(desc(CopingMethod.downvotes) if order == "desc" else CopingMethod.downvotes)
    else:  # Default to created_at
        query = query.order_by(desc(CopingMethod.created_at) if order == "desc" else CopingMethod.created_at)
    
    # Apply pagination
    methods = query.offset(skip).limit(limit).all()
    
    return CopingMethodList(methods=methods)

@router.post("/vote", response_model=CopingMethodResponse)
async def vote_on_coping_method(
    vote_request: VoteRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upvote or downvote a coping method"""
    
    # Get method_id from the request body
    if not hasattr(vote_request, 'method_id') or not vote_request.method_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="method_id is required in the request body"
        )
    
    # Fetch the coping method
    method = db.query(CopingMethod).filter(CopingMethod.id == vote_request.method_id).first()
    if not method:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Coping method with ID {vote_request.method_id} not found"
        )
    
    # Update the vote count
    if vote_request.vote_type == "upvote":
        method.upvotes += 1
    elif vote_request.vote_type == "downvote":
        method.downvotes += 1
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vote type must be either 'upvote' or 'downvote'"
        )
    
    db.commit()
    db.refresh(method)
    
    return method

@router.get("/personalized", response_model=CopingMethodList)
async def get_personalized_coping_techniques(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generate personalized coping techniques based on the user's profile data.
    No request body required - uses profile data automatically.
    Saves generated techniques to the database.
    """
    
    # Check if user has a profile
    if not current_user.profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User profile not found. Please update your profile first."
        )
    
    # Extract profile data
    current_mood = current_user.profile.current_mood
    primary_concerns = current_user.profile.primary_concerns
    
    # Validate that we have enough information
    if not current_mood:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current mood is not set in your profile. Please update your profile first."
        )
    
    # Parse concerns if available
    concerns_list = None
    if primary_concerns:
        # Split by commas or new lines and clean up
        concerns_list = [
            concern.strip() 
            for concern in primary_concerns.replace('\n', ',').split(',')
            if concern.strip()
        ]
    
    try:
        # Generate personalized coping techniques using gemini-2.0-flash model
        # Get existing coping strategy titles to avoid duplicates
        existing_titles = [title[0] for title in db.query(CopingMethod.title).all()]
        
        prompt_addition = f"The person is currently feeling {current_mood}."
        if concerns_list:
            prompt_addition += f" They are concerned about: {', '.join(concerns_list)}."
        
        if current_user.profile.coping_strategies:
            prompt_addition += f" They've previously found these strategies helpful: {current_user.profile.coping_strategies}."
        
        # Generate techniques
        generated_techniques = await gemini_service.generate_coping_methods(
            existing_titles=existing_titles,
            count=5,
            prompt_addition=prompt_addition,
            tags=concerns_list
        )
        
        if not generated_techniques:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to generate personalized coping techniques"
            )
        
        # Save the generated techniques to the database
        saved_methods = []
        for technique in generated_techniques:
            try:
                # Check if the title already exists (to be extra safe)
                existing = db.query(CopingMethod).filter(
                    func.lower(CopingMethod.title) == func.lower(technique["title"])
                ).first()
                
                if existing:
                    continue
                    
                new_method = CopingMethod(
                    title=technique["title"],
                    description=technique["description"],
                    tags=technique["tags"],
                    upvotes=0,
                    downvotes=0
                )
                db.add(new_method)
                db.commit()
                db.refresh(new_method)
                saved_methods.append(new_method)
            except Exception as e:
                logger.error(f"Error saving personalized coping method: {str(e)}")
                db.rollback()
        
        return CopingMethodList(methods=saved_methods)
        
    except Exception as e:
        logger.error(f"Error generating personalized coping techniques: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating personalized coping techniques: {str(e)}"
        )