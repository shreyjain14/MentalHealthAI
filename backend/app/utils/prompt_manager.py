import json
import os
from pathlib import Path
from typing import Optional, Dict, Any, Tuple
import logging

from app.models.user import User
from app.models.user_profile import UserProfile

# Configure logging
logger = logging.getLogger(__name__)

class PromptManager:
    """Manages system prompts and enhances them with user profile data"""
    
    _prompts: Dict[str, Dict[str, Any]] = {}
    _instance = None
    
    def __new__(cls):
        """Singleton pattern to ensure prompts are loaded only once"""
        if cls._instance is None:
            cls._instance = super(PromptManager, cls).__new__(cls)
            cls._instance._load_prompts()
        return cls._instance
    
    def _load_prompts(self):
        """Load prompts from the JSON configuration file"""
        try:
            config_path = Path(__file__).parents[1] / "config" / "prompts.json"
            with open(config_path, "r") as f:
                self._prompts = json.load(f)
            logger.info(f"Loaded {len(self._prompts)} prompts from config")
        except Exception as e:
            logger.error(f"Error loading prompts: {str(e)}")
            # Set default prompt as fallback
            self._prompts = {
                "default": {
                    "prompt": "You are a helpful assistant. Provide clear and accurate information.",
                    "temperature": 0.7
                }
            }
    
    def get_prompt(self, prompt_type: str = "default") -> str:
        """Get a prompt text by type"""
        prompt_data = self._prompts.get(prompt_type, self._prompts.get("default", {"prompt": ""}))
        return prompt_data.get("prompt", "")
    
    def get_temperature(self, prompt_type: str = "default") -> float:
        """Get the recommended temperature for a prompt type"""
        prompt_data = self._prompts.get(prompt_type, self._prompts.get("default", {"temperature": 0.7}))
        return prompt_data.get("temperature", 0.7)
    
    def get_prompt_data(self, prompt_type: str = "default") -> Tuple[str, float]:
        """Get both the prompt text and temperature for a prompt type"""
        prompt_data = self._prompts.get(prompt_type, self._prompts.get("default", {}))
        prompt_text = prompt_data.get("prompt", "")
        temperature = prompt_data.get("temperature", 0.7)
        return prompt_text, temperature
    
    def get_enhanced_prompt(self, user: User, prompt_type: str = "default") -> str:
        """
        Enhance a system prompt with user profile data
        
        This creates a personalized prompt that includes information about the user's:
        - Current mood
        - Primary concerns
        - Coping strategies they've tried
        """
        # Get the base prompt
        base_prompt = self.get_prompt(prompt_type)
        
        # If no user or profile, return the base prompt
        if not user or not user.profile:
            return base_prompt
        
        # Extract profile data
        profile = user.profile
        
        # Build enhanced prompt with profile data
        enhanced_prompt = f"{base_prompt}\n\n"
        enhanced_prompt += "USER CONTEXT:\n"
        
        if profile.current_mood:
            enhanced_prompt += f"- Current mood: {profile.current_mood}\n"
        
        if profile.primary_concerns:
            enhanced_prompt += f"- Primary concerns: {profile.primary_concerns}\n"
        
        if profile.coping_strategies:
            enhanced_prompt += f"- Coping strategies tried: {profile.coping_strategies}\n"
        
        enhanced_prompt += "\nPlease consider this context in your responses."
        
        return enhanced_prompt

# Create a singleton instance
prompt_manager = PromptManager() 