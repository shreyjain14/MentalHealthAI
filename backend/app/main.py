from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from dotenv import load_dotenv

from app.routes import api_router, auth, profiles, coping, relaxation, chat, virtual_pets
from app.database import init_db
from app.middleware.logging import DBSessionMiddleware

# Load environment variables
load_dotenv()

# Create FastAPI application
app = FastAPI(
    title="API Server",
    description="Backend API Server",
    version="0.1.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Add custom middleware
app.add_middleware(DBSessionMiddleware)

# Include API router
app.include_router(api_router, prefix="/api")

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(profiles.router, prefix="/api/profiles", tags=["profiles"])
app.include_router(coping.router, prefix="/api/coping", tags=["coping"])
app.include_router(relaxation.router, prefix="/api/relaxation", tags=["relaxation"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(virtual_pets.router, prefix="/api/virtual-pets", tags=["virtual-pets"])

# Initialize database
@app.on_event("startup")
async def startup_event():
    # Initialize database connections and tables
    init_db()

# Root endpoint
@app.get("/")
async def root():
    return {"message": "Welcome to the API Server"}

if __name__ == "__main__":
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True) 