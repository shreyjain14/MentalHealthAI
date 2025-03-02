from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from typing import List, Optional, Dict, Any
from app.database import get_db
from app.models.relaxation import RelaxationExercise
from app.schemas.relaxation import (
    RelaxationExerciseResponse, 
    RelaxationExerciseList, 
    RelaxationExerciseCreate, 
    VoteRequest,
    GenerateRelaxationExerciseRequest
)
from app.services.gemini_service import gemini_service
from app.auth.utils import get_current_user
from app.models.user import User
from app.logger import get_logger
from pydantic import BaseModel, Field

logger = get_logger(__name__)
router = APIRouter(tags=["relaxation"])

@router.post("/auto-generate", response_model=RelaxationExerciseList)
async def generate_relaxation_exercises(
    generate_request: Optional[GenerateRelaxationExerciseRequest] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generate new relaxation exercises using AI and save them to the database"""
    
    if generate_request is None:
        generate_request = GenerateRelaxationExerciseRequest()
    
    # Get existing titles to avoid duplicates
    existing_titles = [title[0] for title in db.query(RelaxationExercise.title).all()]
    
    # Generate new relaxation exercises using Gemini API
    generated_exercises = await gemini_service.generate_relaxation_exercises(
        existing_titles=existing_titles,
        count=generate_request.count,
        prompt_addition=generate_request.prompt,
        tags=generate_request.tags,
        difficulty=generate_request.difficulty,
        duration=generate_request.duration
    )
    
    if not generated_exercises:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate relaxation exercises"
        )
    
    # Save the generated exercises to the database
    saved_exercises = []
    for exercise in generated_exercises:
        try:
            # Check if the title already exists (to be extra safe)
            existing = db.query(RelaxationExercise).filter(
                func.lower(RelaxationExercise.title) == func.lower(exercise["title"])
            ).first()
            
            if existing:
                continue
                
            new_exercise = RelaxationExercise(
                title=exercise["title"],
                description=exercise["description"],
                instructions=exercise["instructions"],
                duration_minutes=exercise.get("duration_minutes"),
                difficulty_level=exercise.get("difficulty_level"),
                tags=exercise.get("tags", []),
                upvotes=0,
                downvotes=0
            )
            db.add(new_exercise)
            db.commit()
            db.refresh(new_exercise)
            saved_exercises.append(new_exercise)
        except Exception as e:
            logger.error(f"Error saving relaxation exercise: {str(e)}")
            db.rollback()
    
    return RelaxationExerciseList(exercises=saved_exercises)

@router.get("/list", response_model=RelaxationExerciseList)
async def list_relaxation_exercises(
    skip: int = 0, 
    limit: int = 20,
    sort_by: str = "created_at",  # Options: created_at, upvotes, downvotes, duration
    order: str = "desc",
    tag: Optional[str] = None,
    difficulty: Optional[str] = None,
    max_duration: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """Get a list of relaxation exercises with pagination, filtering and sorting options"""
    
    query = db.query(RelaxationExercise)
    
    # Apply filters
    if tag:
        query = query.filter(RelaxationExercise.tags.contains([tag]))
    
    if difficulty:
        query = query.filter(RelaxationExercise.difficulty_level == difficulty)
    
    if max_duration is not None:
        query = query.filter(RelaxationExercise.duration_minutes <= max_duration)
    
    # Apply sorting
    if sort_by == "upvotes":
        query = query.order_by(desc(RelaxationExercise.upvotes) if order == "desc" else RelaxationExercise.upvotes)
    elif sort_by == "downvotes":
        query = query.order_by(desc(RelaxationExercise.downvotes) if order == "desc" else RelaxationExercise.downvotes)
    elif sort_by == "duration":
        query = query.order_by(desc(RelaxationExercise.duration_minutes) if order == "desc" else RelaxationExercise.duration_minutes)
    else:  # Default to created_at
        query = query.order_by(desc(RelaxationExercise.created_at) if order == "desc" else RelaxationExercise.created_at)
    
    # Apply pagination
    exercises = query.offset(skip).limit(limit).all()
    
    return RelaxationExerciseList(exercises=exercises)

@router.post("/vote", response_model=RelaxationExerciseResponse)
async def vote_on_relaxation_exercise(
    vote_request: VoteRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upvote or downvote a relaxation exercise. Simple voting without user tracking"""
    
    # Get exercise_id from the request body
    if not hasattr(vote_request, 'exercise_id') or not vote_request.exercise_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="exercise_id is required in the request body"
        )
    
    # Fetch the relaxation exercise
    exercise = db.query(RelaxationExercise).filter(RelaxationExercise.id == vote_request.exercise_id).first()
    if not exercise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Relaxation exercise with ID {vote_request.exercise_id} not found"
        )
    
    # Validate vote type
    if vote_request.vote_type not in ["upvote", "downvote"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vote type must be either 'upvote' or 'downvote'"
        )
    
    # Update the vote count
    if vote_request.vote_type == "upvote":
        exercise.upvotes += 1
    else:  # downvote
        exercise.downvotes += 1
    
    # Save changes
    db.commit()
    db.refresh(exercise)
    
    return exercise

@router.get("/personalized", response_model=RelaxationExerciseList)
async def get_personalized_relaxation_exercises(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generate personalized relaxation exercises based on the user's profile data.
    No request body required - uses profile data automatically.
    Saves generated exercises to the database.
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
        # Get existing relaxation exercise titles to avoid duplicates
        existing_titles = [title[0] for title in db.query(RelaxationExercise.title).all()]
        
        # Construct prompt based on user's profile data
        prompt_addition = f"The person is currently feeling {current_mood}."
        if concerns_list:
            prompt_addition += f" They are concerned about: {', '.join(concerns_list)}."
        
        if current_user.profile.coping_strategies:
            prompt_addition += f" Their preferred coping strategies include: {current_user.profile.coping_strategies}."
        
        # Generate personalized relaxation exercises
        generated_exercises = await gemini_service.generate_relaxation_exercises(
            existing_titles=existing_titles,
            count=5,
            prompt_addition=prompt_addition,
            tags=concerns_list,
            difficulty=None,  # Let the AI determine appropriate difficulty based on mood/concerns
            duration=None     # Let the AI determine appropriate duration based on mood/concerns
        )
        
        if not generated_exercises:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to generate personalized relaxation exercises"
            )
        
        # Save the generated exercises to the database
        saved_exercises = []
        for exercise in generated_exercises:
            try:
                # Check if the title already exists (to be extra safe)
                existing = db.query(RelaxationExercise).filter(
                    func.lower(RelaxationExercise.title) == func.lower(exercise["title"])
                ).first()
                
                if existing:
                    continue
                    
                new_exercise = RelaxationExercise(
                    title=exercise["title"],
                    description=exercise["description"],
                    instructions=exercise["instructions"],
                    duration_minutes=exercise.get("duration_minutes"),
                    difficulty_level=exercise.get("difficulty_level"),
                    tags=exercise.get("tags", []),
                    upvotes=0,
                    downvotes=0
                )
                db.add(new_exercise)
                db.commit()
                db.refresh(new_exercise)
                saved_exercises.append(new_exercise)
            except Exception as e:
                logger.error(f"Error saving personalized relaxation exercise: {str(e)}")
                db.rollback()
        
        return RelaxationExerciseList(exercises=saved_exercises)
        
    except Exception as e:
        logger.error(f"Error generating personalized relaxation exercises: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating personalized relaxation exercises: {str(e)}"
        )

@router.get("/{exercise_id}", response_model=RelaxationExerciseResponse)
async def get_relaxation_exercise(
    exercise_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """Get a single relaxation exercise by ID"""
    
    exercise = db.query(RelaxationExercise).filter(RelaxationExercise.id == exercise_id).first()
    if not exercise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Relaxation exercise with ID {exercise_id} not found"
        )
    
    return exercise 