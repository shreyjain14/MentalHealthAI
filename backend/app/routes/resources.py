from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from typing import List, Optional

from app.database import get_db
from app.models.user import User
from app.models.resource import ResourceLink
from app.schemas.resource import (
    ResourceLinkCreate, 
    ResourceLinkResponse, 
    ResourceLinkList,
    ResourceLinkVote
)
from app.auth.utils import get_current_user
from app.logger import get_logger

logger = get_logger(__name__)
router = APIRouter(tags=["resources"])

@router.post("/", response_model=ResourceLinkResponse)
async def create_resource_link(
    resource: ResourceLinkCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add a new resource link"""
    
    # Parse the URL into domain and path
    parsed_url = resource.parse_url()
    
    # Create new resource link
    new_resource = ResourceLink(
        user_id=current_user.id,
        domain=parsed_url["domain"],
        path=parsed_url["path"],
        title=resource.title,
        description=resource.description,
        upvotes=0
    )
    
    try:
        db.add(new_resource)
        db.commit()
        db.refresh(new_resource)
        return new_resource
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating resource link: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create resource link"
        )

@router.get("/", response_model=ResourceLinkList)
async def list_resource_links(
    skip: int = 0,
    limit: int = 20,
    domain: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: str = "created_at",  # Options: created_at, upvotes, domain
    order: str = "desc",
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """Get a list of resource links with filtering, searching and sorting"""
    
    # Base query
    query = db.query(ResourceLink)
    
    # Apply domain filter
    if domain:
        query = query.filter(ResourceLink.domain == domain)
    
    # Apply search filter
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (ResourceLink.title.ilike(search_term)) |
            (ResourceLink.description.ilike(search_term)) |
            (ResourceLink.domain.ilike(search_term)) |
            (ResourceLink.path.ilike(search_term))
        )
    
    # Get total count for pagination
    total = query.count()
    
    # Apply sorting
    if sort_by == "upvotes":
        query = query.order_by(desc(ResourceLink.upvotes) if order == "desc" else ResourceLink.upvotes)
    elif sort_by == "domain":
        query = query.order_by(desc(ResourceLink.domain) if order == "desc" else ResourceLink.domain)
    else:  # Default to created_at
        query = query.order_by(desc(ResourceLink.created_at) if order == "desc" else ResourceLink.created_at)
    
    # Apply pagination
    resources = query.offset(skip).limit(limit).all()
    
    return ResourceLinkList(resources=resources, total=total)

@router.post("/vote", response_model=ResourceLinkResponse)
async def upvote_resource(
    vote_request: ResourceLinkVote,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upvote a resource link"""
    
    # Fetch the resource
    resource = db.query(ResourceLink).filter(ResourceLink.id == vote_request.resource_id).first()
    if not resource:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Resource with ID {vote_request.resource_id} not found"
        )
    
    # Increment upvotes
    resource.upvotes += 1
    
    # Save changes
    db.commit()
    db.refresh(resource)
    
    return resource

@router.get("/domains", response_model=List[str])
async def list_domains(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """Get a list of all unique domains for filtering"""
    
    domains = [domain[0] for domain in db.query(ResourceLink.domain).distinct().all()]
    return domains

@router.get("/{resource_id}", response_model=ResourceLinkResponse)
async def get_resource(
    resource_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """Get a single resource link by ID"""
    
    resource = db.query(ResourceLink).filter(ResourceLink.id == resource_id).first()
    if not resource:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Resource with ID {resource_id} not found"
        )
    
    return resource 