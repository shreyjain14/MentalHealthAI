import httpx
import json
import asyncio
from typing import AsyncGenerator, Dict, Any, List, Optional
import os
from dotenv import load_dotenv

load_dotenv()

# Configuration
OLLAMA_API_URL = os.getenv("OLLAMA_API_URL", "http://localhost:11434")
DEFAULT_MODEL = "deepseek-r1:8b"
DEFAULT_TEMPERATURE = 0.7
DEFAULT_TOP_P = 0.9
DEFAULT_MAX_TOKENS = 1000

class OllamaService:
    """Service for interacting with Ollama models"""
    
    @staticmethod
    async def generate_stream(
        prompt: str,
        model: str = DEFAULT_MODEL,
        system_prompt: Optional[str] = None,
        temperature: float = DEFAULT_TEMPERATURE,
        top_p: float = DEFAULT_TOP_P,
        max_tokens: int = DEFAULT_MAX_TOKENS,
        history: Optional[List[Dict[str, str]]] = None
    ) -> AsyncGenerator[str, None]:
        """
        Generate a streaming response from Ollama models
        """
        if history is None:
            history = []
            
        url = f"{OLLAMA_API_URL}/api/chat"
        
        payload = {
            "model": model,
            "messages": history + [{"role": "user", "content": prompt}],
            "stream": True,
            "options": {
                "temperature": temperature,
                "top_p": top_p,
                "num_predict": max_tokens
            }
        }
        
        if system_prompt:
            payload["system"] = system_prompt
            
        async with httpx.AsyncClient() as client:
            async with client.stream("POST", url, json=payload, timeout=60.0) as response:
                response.raise_for_status()
                
                buffer = ""
                async for chunk in response.aiter_text():
                    try:
                        # Process each chunk from Ollama's streaming API
                        if chunk.strip():
                            chunk_data = json.loads(chunk)
                            if "message" in chunk_data and "content" in chunk_data["message"]:
                                content = chunk_data["message"]["content"]
                                yield content
                            elif "done" in chunk_data and chunk_data["done"]:
                                break
                    except json.JSONDecodeError:
                        # If we get an incomplete JSON, buffer it
                        buffer += chunk
                        try:
                            chunk_data = json.loads(buffer)
                            buffer = ""
                            if "message" in chunk_data and "content" in chunk_data["message"]:
                                content = chunk_data["message"]["content"]
                                yield content
                            elif "done" in chunk_data and chunk_data["done"]:
                                break
                        except json.JSONDecodeError:
                            # Still incomplete, continue buffering
                            continue 