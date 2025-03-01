from fastapi import APIRouter
from app.routes.users import router as users_router
from app.routes.logs import router as logs_router
from app.routes.auth import router as auth_router
from app.routes.profiles import router as profiles_router
from app.routes.chat import router as chat_router

api_router = APIRouter()

# Import and include other route modules here
# Example: from .users import router as users_router
# api_router.include_router(users_router, prefix="/users", tags=["users"])

# Include user routes
api_router.include_router(users_router, prefix="/users", tags=["users"])

# Include logs routes
api_router.include_router(logs_router, prefix="/logs", tags=["logs"])

# Include auth routes
api_router.include_router(auth_router, prefix="/auth", tags=["auth"])

# Include profile routes
api_router.include_router(profiles_router, prefix="/profiles", tags=["profiles"])

# Include chat routes
api_router.include_router(chat_router, prefix="/chat", tags=["chat"]) 