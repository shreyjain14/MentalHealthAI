import os
import json
import google.generativeai as genai
from typing import List, Dict, Any, Optional
from app.logger import get_logger

logger = get_logger(__name__)

class GeminiService:
    def __init__(self):
        self.api_key = os.environ.get("GEMINI_API_KEY")
        if not self.api_key:
            logger.warning("GEMINI_API_KEY not found in environment variables")
        else:
            # Configure the genai library with API key
            genai.configure(api_key=self.api_key)
        
    async def generate_coping_methods(
        self, 
        existing_titles: List[str], 
        count: int = 5, 
        prompt_addition: Optional[str] = None,
        tags: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        """
        Generate coping methods using Gemini API via the official SDK
        
        Args:
            existing_titles: List of existing titles to avoid duplicates
            count: Number of coping methods to generate
            prompt_addition: Additional prompt text to guide generation
            tags: Specific tags to include in generation
        
        Returns:
            List of dictionaries with title, description, and tags
        """
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY is not set in environment variables")
        
        # Construct the prompt
        base_prompt = (
            f"Generate {count} unique coping techniques for mental health and stress management. "
            f"Each technique should have a title, description, and relevant tags. "
        )
        
        if existing_titles:
            base_prompt += f"Avoid these existing titles: {', '.join(existing_titles)}. "
        
        if tags:
            base_prompt += f"Include techniques relevant to these tags: {', '.join(tags)}. "
        
        if prompt_addition:
            base_prompt += f"Additional requirements: {prompt_addition}. "
        
        base_prompt += (
            "Format the response as a JSON array of objects, where each object has the following structure: "
            "{'title': 'Technique Name', 'description': 'Detailed explanation of technique', 'tags': ['tag1', 'tag2']}. "
            "Make sure the descriptions are helpful, practical, and 2-4 sentences long. "
            "The tags should be relevant categories like 'anxiety', 'depression', 'stress', 'mindfulness', etc. "
            "IMPORTANT: Return ONLY the JSON array without any explanations or text before or after it."
        )
        
        # Use the gemini-pro model
        model = genai.GenerativeModel('gemini-2.0-flash')
        
        generation_config = {
            "temperature": 0.7,
            "top_p": 0.95,
            "top_k": 40,
            "max_output_tokens": 1024,
        }
        
        try:
            # Generate content using the async API
            response = await model.generate_content_async(
                base_prompt,
                generation_config=generation_config
            )
            
            # Extract the generated text
            generated_text = response.text
            
            # Parse the JSON from the text
            # First, try to find and extract a JSON array
            json_start = generated_text.find("[")
            json_end = generated_text.rfind("]") + 1
            
            if json_start >= 0 and json_end > json_start:
                json_text = generated_text[json_start:json_end]
                methods = json.loads(json_text)
                return methods
            else:
                logger.error(f"Failed to parse JSON from Gemini response: {generated_text}")
                # Attempt alternate parsing as a fallback
                try:
                    # Try to find any JSON-like structure
                    import re
                    matches = re.findall(r'\{[^{}]*\}', generated_text)
                    methods = []
                    for match in matches[:count]:
                        try:
                            method = json.loads(match)
                            if 'title' in method and 'description' in method:
                                if 'tags' not in method:
                                    method['tags'] = []
                                methods.append(method)
                        except:
                            pass
                    return methods
                except Exception as parsing_error:
                    logger.error(f"Error parsing response: {str(parsing_error)}")
                    return []
        
        except Exception as e:
            logger.error(f"Error generating coping methods: {str(e)}")
            return []

    async def get_coping_suggestions_for_mood(
        self,
        current_mood: str,
        concerns: Optional[List[str]] = None,
        count: int = 3
    ) -> List[Dict[str, Any]]:
        """
        Generate personalized coping suggestions based on a user's current mood and concerns
        
        Args:
            current_mood: User's current emotional state
            concerns: List of specific concerns or issues the user is facing
            count: Number of suggestions to generate
            
        Returns:
            List of dictionaries with title, description, and tags
        """
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY is not set in environment variables")
            
        # Construct a personalized prompt
        prompt = (
            f"Generate {count} helpful coping strategies for someone who is feeling {current_mood}. "
        )
        
        if concerns and len(concerns) > 0:
            prompt += f"They are specifically concerned about: {', '.join(concerns)}. "
            
        prompt += (
            "Each strategy should be immediately actionable and specific to their current state. "
            "Format the response as a JSON array of objects, where each object has the following structure: "
            "{'title': 'Strategy Name', 'description': 'Detailed explanation of strategy', 'tags': ['tag1', 'tag2']}. "
            "Make the descriptions compassionate, practical, and 2-3 sentences long. "
            "IMPORTANT: Return ONLY the JSON array without any explanations or text before or after it."
        )
        
        # Use the gemini-pro model
        model = genai.GenerativeModel('gemini-pro')
        
        generation_config = {
            "temperature": 0.8,  # Slightly higher temperature for more diverse suggestions
            "top_p": 0.95,
            "top_k": 40,
            "max_output_tokens": 1024,
        }
        
        try:
            # Generate content using the async API
            response = await model.generate_content_async(
                prompt,
                generation_config=generation_config
            )
            
            # Extract and parse the response
            generated_text = response.text
            
            # Find JSON array in the text
            json_start = generated_text.find("[")
            json_end = generated_text.rfind("]") + 1
            
            if json_start >= 0 and json_end > json_start:
                json_text = generated_text[json_start:json_end]
                suggestions = json.loads(json_text)
                return suggestions
            else:
                logger.error(f"Failed to parse JSON from Gemini response for mood suggestions: {generated_text}")
                return []
                
        except Exception as e:
            logger.error(f"Error generating mood-based coping suggestions: {str(e)}")
            return []
            
    async def generate_relaxation_exercises(
        self, 
        existing_titles: List[str], 
        count: int = 5, 
        prompt_addition: Optional[str] = None,
        tags: Optional[List[str]] = None,
        difficulty: Optional[str] = None,
        duration: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """
        Generate relaxation exercise suggestions using Gemini API
        
        Args:
            existing_titles: List of existing titles to avoid duplicates
            count: Number of exercises to generate
            prompt_addition: Additional prompt text to guide generation
            tags: Specific tags to include in generation
            difficulty: Target difficulty level (beginner, intermediate, advanced)
            duration: Target duration in minutes
            
        Returns:
            List of dictionaries with title, description, instructions, duration, difficulty and tags
        """
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY is not set in environment variables")
        
        # Construct the prompt
        base_prompt = (
            f"Generate {count} unique relaxation exercises for stress relief and mental wellbeing. "
            f"Each exercise should have a title, description, detailed step-by-step instructions, "
            f"duration in minutes, difficulty level, and relevant tags. "
        )
        
        if existing_titles:
            base_prompt += f"Avoid these existing titles: {', '.join(existing_titles)}. "
        
        if tags:
            base_prompt += f"Include exercises relevant to these tags: {', '.join(tags)}. "
            
        if difficulty:
            base_prompt += f"The exercises should be at {difficulty} difficulty level. "
            
        if duration:
            base_prompt += f"The exercises should take approximately {duration} minutes to complete. "
        
        if prompt_addition:
            base_prompt += f"Additional requirements: {prompt_addition}. "
        
        base_prompt += (
            "Format the response as a JSON array of objects, where each object has the following structure: "
            "{'title': 'Exercise Name', 'description': 'Brief explanation of benefits', "
            "'instructions': 'Detailed step-by-step instructions', 'duration_minutes': integer, "
            "'difficulty_level': 'beginner/intermediate/advanced', 'tags': ['tag1', 'tag2']}. "
            "Make sure the descriptions are concise (1-2 sentences) and instructions are detailed and clear (3-6 steps). "
            "The tags should be relevant categories like 'breathing', 'meditation', 'progressive relaxation', etc. "
            "IMPORTANT: Return ONLY the JSON array without any explanations or text before or after it."
        )
        
        # Use the gemini-pro model
        model = genai.GenerativeModel('gemini-2.0-flash')
        
        generation_config = {
            "temperature": 0.7,
            "top_p": 0.95,
            "top_k": 40,
            "max_output_tokens": 1024,
        }
        
        try:
            # Generate content using the async API
            response = await model.generate_content_async(
                base_prompt,
                generation_config=generation_config
            )
            
            # Extract the generated text
            generated_text = response.text
            
            # Parse the JSON from the text
            try:
                # First, try direct JSON loading (if the entire response is a valid JSON array)
                try:
                    exercises = json.loads(generated_text.strip())
                    if isinstance(exercises, list):
                        return exercises
                except json.JSONDecodeError:
                    pass
                
                # Second, try to find and extract a JSON array with regex pattern
                import re
                json_pattern = r'\[\s*{.*}\s*\]'
                json_matches = re.search(json_pattern, generated_text, re.DOTALL)
                
                if json_matches:
                    json_text = json_matches.group(0)
                    try:
                        exercises = json.loads(json_text)
                        return exercises
                    except json.JSONDecodeError:
                        pass
                
                # Third, as a fallback, try manual extraction
                json_start = generated_text.find("[")
                json_end = generated_text.rfind("]") + 1
                
                if json_start >= 0 and json_end > json_start:
                    json_text = generated_text[json_start:json_end]
                    try:
                        exercises = json.loads(json_text)
                        return exercises
                    except json.JSONDecodeError as e:
                        logger.error(f"JSON parsing error: {str(e)} in text: {json_text[:100]}...")
                
                # If all parsing attempts fail, log the response and return empty list
                logger.error(f"Failed to parse JSON from Gemini response. Full response: {generated_text[:500]}...")
                return []
                
            except Exception as parse_error:
                logger.error(f"Error parsing Gemini response: {str(parse_error)}")
                logger.error(f"Raw response text: {generated_text[:500]}...")
                return []
        
        except Exception as e:
            logger.error(f"Error generating relaxation exercises: {str(e)}")
            return []

# Create a singleton instance
gemini_service = GeminiService() 