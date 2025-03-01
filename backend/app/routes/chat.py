from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
import json
import asyncio

from app.database import get_db
from app.models.user import User
from app.models.chat import ChatMessage
from app.schemas.chat import ChatMessageCreate, ChatMessage as ChatMessageSchema, ChatHistory
from app.auth.utils import get_current_active_user
from app.services.ollama import OllamaService

router = APIRouter()

# Store active WebSocket connections
active_connections: Dict[int, WebSocket] = {}

async def authenticate_websocket(websocket: WebSocket, token: str, db: Session) -> Optional[User]:
    """Authenticate a WebSocket connection using JWT token"""
    from app.auth.utils import jwt, SECRET_KEY, ALGORITHM, JWTError
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            return None
        
        user = db.query(User).filter(User.username == username).first()
        if user is None or not user.is_active:
            return None
            
        return user
    except JWTError:
        return None

@router.websocket("/ws/{token}")
async def websocket_chat(websocket: WebSocket, token: str, db: Session = Depends(get_db)):
    """WebSocket endpoint for real-time chat with streaming responses"""
    
    # Accept the WebSocket connection
    await websocket.accept()
    
    # Authenticate the user
    user = await authenticate_websocket(websocket, token, db)
    if not user:
        await websocket.send_text(json.dumps({"error": "Authentication failed"}))
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return
    
    # Store the connection
    active_connections[user.id] = websocket
    
    try:
        while True:
            # Receive message from WebSocket
            data = await websocket.receive_text()
            try:
                request_data = json.loads(data)
                message = request_data.get("message")
                system_prompt = request_data.get("system_prompt")
                temperature = request_data.get("temperature")
                top_p = request_data.get("top_p")
                max_tokens = request_data.get("max_tokens")
                
                if not message:
                    await websocket.send_text(json.dumps({"error": "Message is required"}))
                    continue
                
                # Create a new chat message record
                db_message = ChatMessage(
                    user_id=user.id,
                    message=message
                )
                db.add(db_message)
                db.commit()
                db.refresh(db_message)
                
                # Send back the message ID so client can track this conversation
                await websocket.send_text(json.dumps({
                    "message_id": db_message.id,
                    "type": "start"
                }))
                
                # Get streaming response from Ollama
                full_response = ""
                async for chunk in OllamaService.generate_stream(
                    prompt=message,
                    system_prompt=system_prompt,
                    temperature=temperature if temperature is not None else None,
                    top_p=top_p if top_p is not None else None,
                    max_tokens=max_tokens if max_tokens is not None else None
                ):
                    full_response += chunk
                    # Send each chunk as it arrives
                    await websocket.send_text(json.dumps({
                        "message_id": db_message.id,
                        "chunk": chunk,
                        "type": "chunk"
                    }))
                    await asyncio.sleep(0.01)  # Small delay for smoother streaming
                
                # Update the database with the full response
                db_message.response = full_response
                db.commit()
                
                # Send completion signal
                await websocket.send_text(json.dumps({
                    "message_id": db_message.id,
                    "type": "end"
                }))
                
            except json.JSONDecodeError:
                await websocket.send_text(json.dumps({"error": "Invalid JSON"}))
                
    except WebSocketDisconnect:
        # Remove connection when client disconnects
        if user.id in active_connections:
            del active_connections[user.id]
    
    except Exception as e:
        # Handle any other exceptions
        await websocket.send_text(json.dumps({"error": str(e)}))
        if user.id in active_connections:
            del active_connections[user.id]

@router.get("/history", response_model=List[ChatMessageSchema])
async def get_chat_history(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get the chat history for the current user"""
    messages = db.query(ChatMessage).filter(
        ChatMessage.user_id == current_user.id
    ).order_by(
        ChatMessage.created_at.desc()
    ).offset(skip).limit(limit).all()
    
    return messages 