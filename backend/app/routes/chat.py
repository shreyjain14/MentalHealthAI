from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
import json
import asyncio
import logging

from app.database import get_db
from app.models.user import User
from app.models.chat import ChatMessage
from app.schemas.chat import ChatMessageCreate, ChatMessage as ChatMessageSchema, ChatHistory
from app.auth.utils import get_current_active_user
from app.services.ollama import OllamaService
from app.utils.prompt_manager import prompt_manager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# Store active WebSocket connections
active_connections: Dict[int, WebSocket] = {}

async def authenticate_websocket(websocket: WebSocket, token: str, db: Session) -> Optional[User]:
    """Authenticate a WebSocket connection using JWT token"""
    from app.auth.utils import jwt, SECRET_KEY, ALGORITHM, JWTError
    
    try:
        logger.info(f"Attempting to authenticate WebSocket with token: {token[:10]}...")
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            logger.warning("No username in token payload")
            return None
        
        logger.info(f"Looking up user: {username}")
        user = db.query(User).filter(User.username == username).first()
        if user is None or not user.is_active:
            logger.warning(f"User not found or inactive: {username}")
            return None
        
        logger.info(f"Successfully authenticated user: {username}")
        return user
    except JWTError as e:
        logger.error(f"JWT error: {str(e)}")
        return None
    except Exception as e:
        logger.error(f"Unexpected error during authentication: {str(e)}")
        return None

@router.websocket("/ws/{token}")
async def websocket_chat(websocket: WebSocket, token: str, db: Session = Depends(get_db)):
    """WebSocket endpoint for real-time chat with streaming responses"""
    
    logger.info("New WebSocket connection attempt")
    
    try:
        # Accept the WebSocket connection
        await websocket.accept()
        logger.info("WebSocket connection accepted")
        
        # Authenticate the user
        user = await authenticate_websocket(websocket, token, db)
        if not user:
            logger.warning("Authentication failed, closing connection")
            await websocket.send_text(json.dumps({"error": "Authentication failed"}))
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return
        
        # Store the connection
        active_connections[user.id] = websocket
        logger.info(f"User {user.username} connected via WebSocket")
        
        # Send a welcome message
        await websocket.send_text(json.dumps({
            "type": "system",
            "message": "Connected successfully! Starting chat session..."
        }))
        
        # Get the AI-Chat prompt enhanced with user profile data
        enhanced_prompt = prompt_manager.get_enhanced_prompt(user, "ai-chat")
        temperature = prompt_manager.get_temperature("ai-chat")
        
        # Create a greeting message in the database
        logger.info("Creating initial greeting message")
        greeting_message = ChatMessage(
            user_id=user.id,
            message="[SYSTEM GREETING: " + enhanced_prompt[:50] + "...]"  # Include part of the prompt to identify it
        )
        db.add(greeting_message)
        db.commit()
        db.refresh(greeting_message)
        
        # Send message ID for the greeting
        await websocket.send_text(json.dumps({
            "message_id": greeting_message.id,
            "type": "start"
        }))
        
        # Generate AI response to the enhanced prompt
        logger.info(f"Generating initial AI greeting using prompt: {enhanced_prompt[:50]}...")
        full_response = ""
        try:
            # Stream the AI's greeting response
            async for chunk in OllamaService.generate_stream(
                prompt=enhanced_prompt,  # Send the enhanced prompt as the user message
                system_prompt="",  # No additional system prompt needed
                temperature=temperature
            ):
                full_response += chunk
                # Send each chunk as it arrives
                await websocket.send_text(json.dumps({
                    "message_id": greeting_message.id,
                    "chunk": chunk,
                    "type": "chunk"
                }))
                await asyncio.sleep(0.01)  # Small delay for smoother streaming
            
            # Update the database with the full response
            greeting_message.response = full_response
            db.commit()
            logger.info("Completed initial AI greeting")
            
            # Send completion signal
            await websocket.send_text(json.dumps({
                "message_id": greeting_message.id,
                "type": "end"
            }))
        except Exception as e:
            logger.error(f"Error generating initial greeting: {str(e)}")
            await websocket.send_text(json.dumps({
                "message_id": greeting_message.id,
                "error": f"Error generating initial greeting: {str(e)}",
                "type": "error"
            }))
            # Still save what we have
            greeting_message.response = full_response
            db.commit()
        
        while True:
            # Receive message from WebSocket
            logger.info("Waiting for message...")
            data = await websocket.receive_text()
            logger.info(f"Received message from user {user.username}")
            
            try:
                request_data = json.loads(data)
                message = request_data.get("message")
                # Ignore user-selected prompt_type and always use "ai-chat"
                prompt_type = "ai-chat"
                
                # Get temperature from the ai-chat config or use requested value
                requested_temp = request_data.get("temperature")
                temperature = requested_temp if requested_temp is not None else prompt_manager.get_temperature(prompt_type)
                
                top_p = request_data.get("top_p")
                max_tokens = request_data.get("max_tokens")
                
                if not message:
                    logger.warning("Empty message received")
                    await websocket.send_text(json.dumps({"error": "Message is required"}))
                    continue
                
                # Create a new chat message record
                logger.info("Creating chat message record")
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
                
                # Get streaming response from Ollama - no system prompt needed now as the context is already established
                logger.info(f"Generating response from Ollama for message {db_message.id}")
                full_response = ""
                try:
                    async for chunk in OllamaService.generate_stream(
                        prompt=message,
                        system_prompt="",  # No system prompt needed for subsequent messages
                        temperature=temperature,
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
                    logger.info(f"Completed response for message {db_message.id}")
                    
                    # Send completion signal
                    await websocket.send_text(json.dumps({
                        "message_id": db_message.id,
                        "type": "end"
                    }))
                except Exception as e:
                    logger.error(f"Error generating response: {str(e)}")
                    await websocket.send_text(json.dumps({
                        "message_id": db_message.id,
                        "error": f"Error generating response: {str(e)}",
                        "type": "error"
                    }))
                    # Still save what we have
                    db_message.response = full_response
                    db.commit()
                
            except json.JSONDecodeError:
                logger.error("Invalid JSON received")
                await websocket.send_text(json.dumps({"error": "Invalid JSON"}))
                
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for user {user.id if 'user' in locals() else 'unknown'}")
        # Remove connection when client disconnects
        if 'user' in locals() and user and user.id in active_connections:
            del active_connections[user.id]
    
    except Exception as e:
        # Handle any other exceptions
        logger.error(f"Unexpected error in WebSocket handler: {str(e)}")
        try:
            await websocket.send_text(json.dumps({"error": str(e)}))
        except:
            pass
        if 'user' in locals() and user and user.id in active_connections:
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