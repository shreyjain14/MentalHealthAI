from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime, timedelta
from app.database import get_db
from app.models.log import Log
from app.models.user import User
from app.auth.utils import get_current_superuser
from pydantic import BaseModel

router = APIRouter()

class LogResponse(BaseModel):
    id: int
    timestamp: datetime
    level: str
    message: str
    method: Optional[str] = None
    path: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    request_id: Optional[str] = None
    user_id: Optional[int] = None
    
    model_config = {"from_attributes": True}

@router.get("/", response_model=List[LogResponse])
def get_logs(
    level: Optional[str] = None,
    path: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    user_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superuser)  # Only superusers can access this endpoint
):
    """Get logs with optional filtering - only accessible by superusers"""
    query = db.query(Log)
    
    # Apply filters
    if level:
        query = query.filter(Log.level == level)
    if path:
        query = query.filter(Log.path.contains(path))
    if start_date:
        query = query.filter(Log.timestamp >= start_date)
    if end_date:
        query = query.filter(Log.timestamp <= end_date)
    if user_id:
        query = query.filter(Log.user_id == user_id)
    
    # Order by timestamp descending (newest first)
    query = query.order_by(Log.timestamp.desc())
    
    # Paginate results
    logs = query.offset(skip).limit(limit).all()
    
    return logs

@router.get("/stats", response_model=dict)
def get_log_stats(
    days: int = Query(7, ge=1, le=30),
    db: Session = Depends(get_db)
):
    """Get log statistics for the specified number of days - publicly accessible"""
    # Calculate start date
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # Get total count
    total_count = db.query(Log).filter(Log.timestamp >= start_date).count()
    
    # Get count by level
    level_counts = {}
    for level in ["INFO", "WARNING", "ERROR", "CRITICAL"]:
        count = db.query(Log).filter(
            Log.level == level,
            Log.timestamp >= start_date
        ).count()
        level_counts[level] = count
    
    # Get most accessed paths
    path_query = db.query(
        Log.path, 
        func.count(Log.id).label("count")
    ).filter(
        Log.timestamp >= start_date,
        Log.path != None
    ).group_by(
        Log.path
    ).order_by(
        func.count(Log.id).desc()
    ).limit(10)
    
    top_paths = {path: count for path, count in path_query}
    
    return {
        "total_count": total_count,
        "by_level": level_counts,
        "top_paths": top_paths,
        "period_days": days
    } 