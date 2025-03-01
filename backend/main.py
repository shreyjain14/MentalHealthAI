from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.routes import api_router
from app.database import Base, engine
from app.middleware import DBLoggingMiddleware, DBSessionMiddleware
from app.logger import logger

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="FastAPI Backend",
    description="A modular FastAPI backend with PostgreSQL and database logging",
    version="1.0.0",
    # Enable default docs
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add DB session middleware first (must come before logging middleware)
app.add_middleware(DBSessionMiddleware)

# Add logging middleware
app.add_middleware(DBLoggingMiddleware)

# Include API router
app.include_router(api_router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "Welcome to FastAPI Backend"} 