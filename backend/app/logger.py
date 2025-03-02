import sys
import uuid
from datetime import datetime
from loguru import logger
from sqlalchemy.orm import Session
from fastapi import Request
from contextvars import ContextVar
from sqlalchemy.exc import SQLAlchemyError

# Remove default handler
logger.remove()

# Add console handler for development
logger.add(sys.stderr, level="INFO")

# Create a context variable to store request ID
request_id_contextvar = ContextVar("request_id", default=None)

def get_logger(name=None):
    """
    Returns a logger instance with the given name.
    This function is used to provide a consistent logging interface across the application.
    
    Args:
        name: The name of the module using the logger
        
    Returns:
        A logger instance
    """
    return logger.bind(module=name)

class DBLogger:
    """Handler for logging to database"""
    
    def __init__(self):
        self.db = None
    
    def set_db(self, db: Session):
        """Set the database session"""
        self.db = db
    
    def log_to_db(self, message, level, request=None, user_id=None, additional_data=None):
        """Log a message to the database"""
        if not self.db:
            logger.warning("Database session not available for logging")
            return
        
        # Get request details if available
        method = None
        path = None
        ip_address = None
        user_agent = None
        req_id = request_id_contextvar.get()
        
        if request:
            method = request.method
            path = request.url.path
            ip_address = request.client.host if request.client else None
            user_agent = request.headers.get("user-agent")
        
        try:
            # Import here to avoid circular imports
            from app.models.log import Log
            
            # Create log entry
            log_entry = Log(
                timestamp=datetime.utcnow(),
                level=level,
                message=message,
                method=method,
                path=path,
                ip_address=ip_address,
                user_agent=user_agent,
                request_id=req_id,
                user_id=user_id,
                additional_data=additional_data
            )
            
            try:
                self.db.add(log_entry)
                self.db.commit()
            except SQLAlchemyError as e:
                self.db.rollback()
                logger.error(f"Failed to write log to database: {str(e)}")
        except ImportError:
            logger.warning("Log model not available")
        except Exception as e:
            logger.error(f"Logging error: {str(e)}")

# Create a global DB logger instance
db_logger = DBLogger()

def log_request(request: Request, db: Session):
    """Generate request ID and log the request"""
    try:
        # Generate a unique request ID
        req_id = str(uuid.uuid4())
        request_id_contextvar.set(req_id)
        
        # Set the database session
        db_logger.set_db(db)
        
        # Log the request
        message = f"Request: {request.method} {request.url.path}"
        db_logger.log_to_db(message, "INFO", request)
    except Exception as e:
        logger.error(f"Failed to log request: {str(e)}")
        # We don't want logging failures to crash the application 