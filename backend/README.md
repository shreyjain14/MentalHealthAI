# FastAPI Backend

A modular FastAPI backend application with a well-organized structure.

## Project Structure

```
.
├── app/
│   ├── models/         # SQLAlchemy models
│   ├── routes/         # API routes/endpoints
│   ├── schemas/        # Pydantic models/schemas
│   └── database.py     # Database configuration
├── main.py            # FastAPI application instance
└── requirements.txt    # Project dependencies
```

## Setup

1. Create and activate a virtual environment:

```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Run the application:

```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

## API Documentation

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Features

- Modular project structure
- SQLAlchemy integration
- Pydantic models for request/response validation
- CORS middleware configured
- Automatic API documentation
- Base models with timestamp tracking
