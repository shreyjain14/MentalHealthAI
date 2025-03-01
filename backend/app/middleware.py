from fastapi import Request, Depends
from starlette.middleware.base import BaseHTTPMiddleware
from sqlalchemy.orm import Session
from app.database import get_db
from app.logger import log_request, logger, db_logger
import time
import asyncio

class DBLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Start timer
        start_time = time.time()
        
        # Get DB connection from request state if available
        # This is a workaround since middleware can't use Depends
        db = None
        
        # Process the request
        try:
            response = await call_next(request)
            
            # Try to get DB session
            db = request.state.db if hasattr(request.state, "db") else None
            
            # Log after response to include duration
            if db:
                db_logger.set_db(db)
                duration = time.time() - start_time
                path = request.url.path
                status_code = response.status_code
                message = f"{request.method} {path} completed with status {status_code} in {duration:.3f}s"
                db_logger.log_to_db(message, "INFO", request)
                
            return response
        except Exception as e:
            if db:
                db_logger.set_db(db)
                db_logger.log_to_db(f"Error processing request: {str(e)}", "ERROR", request)
            raise

class DBSessionMiddleware(BaseHTTPMiddleware):
    """Middleware to add DB session to request state for logging"""
    
    async def dispatch(self, request: Request, call_next):
        # Create a new generator for each request
        db_generator = get_db()
        
        try:
            # Get DB session
            db = next(db_generator)
            
            # Add to request state
            request.state.db = db
            
            try:
                # Log the request
                log_request(request, db)
                
                # Process the request
                response = await call_next(request)
                return response
            finally:
                # Close the DB session
                db.close()
        except Exception as e:
            logger.error(f"Database session error: {str(e)}")
            # Continue processing even if DB session fails
            return await call_next(request) 