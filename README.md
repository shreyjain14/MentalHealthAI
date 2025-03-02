# Fullstack Application

This repository contains a fullstack application with a FastAPI backend and a Next.js frontend. The backend uses Ollama's llama3.1 8b (or any other model can be changed [here](backend/app/services/ollama.py)) model for AI capabilities.

## Project Structure

```
.
├── backend/               # FastAPI backend
│   ├── app/               # Application modules
│   ├── main.py            # Entry point for the backend
│   └── requirements.txt   # Python dependencies
│
└── frontend/              # Next.js frontend
    ├── src/               # Source code
    ├── public/            # Static files
    └── package.json       # Node.js dependencies
```

## Prerequisites

- [Ollama](https://ollama.ai/download)
- [Python](https://www.python.org/downloads/) 3.9+
- [Node.js](https://nodejs.org/) 18+
- [PostgreSQL](https://www.postgresql.org/download/)

## Environment Variables

Before running the application, create a `.env` file in the `backend` directory using the `.env.example` template.

This starts the application in development mode with hot reloading enabled.

## Local Development

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:

   ```bash
   python -m venv .venv
   # On Windows
   .\.venv\Scripts\activate
   # On Unix/MacOS
   source .venv/bin/activate
   ```

3. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Start the Ollama model:

   ```bash
   ollama run deepseek-r1:8b
   ```

5. Run the backend server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

## API Documentation

After starting the backend, the API documentation is available at:

- Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
- ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

## Accessing the Application

- Backend API: [http://localhost:8000](http://localhost:8000)
- Frontend: [http://localhost:3000](http://localhost:3000)
