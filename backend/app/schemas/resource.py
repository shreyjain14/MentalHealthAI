from pydantic import BaseModel, Field, HttpUrl
from typing import List, Optional
from datetime import datetime
import re
from urllib.parse import urlparse

class ResourceLinkBase(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None

class ResourceLinkCreate(ResourceLinkBase):
    url: str = Field(..., description="Full URL of the resource")
    
    def parse_url(self) -> dict:
        """Parse the URL into domain and path components"""
        # Add scheme if missing
        if not re.match(r'^https?://', self.url):
            full_url = f"https://{self.url}"
        else:
            full_url = self.url
            
        # Parse the URL
        parsed = urlparse(full_url)
        
        # Extract domain (remove 'www.' prefix if present)
        domain = parsed.netloc
        if domain.startswith('www.'):
            domain = domain[4:]
            
        # Extract path and query
        path = parsed.path
        if parsed.query:
            path = f"{path}?{parsed.query}"
        if parsed.fragment:
            path = f"{path}#{parsed.fragment}"
            
        return {
            "domain": domain,
            "path": path.strip('/') if path else None
        }

class ResourceLinkUpdate(ResourceLinkBase):
    pass

class ResourceLinkVote(BaseModel):
    resource_id: int = Field(..., description="ID of the resource to upvote")

class ResourceLinkResponse(ResourceLinkBase):
    id: int
    domain: str
    path: Optional[str]
    upvotes: int
    created_at: datetime
    
    # Computed property to reconstruct the full URL
    @property
    def full_url(self) -> str:
        if self.path:
            return f"https://{self.domain}/{self.path}"
        return f"https://{self.domain}"
    
    model_config = {"from_attributes": True}

class ResourceLinkList(BaseModel):
    resources: List[ResourceLinkResponse]
    total: int 