from pydantic import BaseModel, HttpUrl, Field, EmailStr
from typing import Optional, List
from datetime import date, datetime

# -------- Project --------
class ProjectBase(BaseModel):
    title: str
    description: str
    tech_stack: List[str] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)
    cover_image_url: Optional[str] = None
    images: List[str] = Field(default_factory=list)
    github_url: Optional[str] = None
    live_url: Optional[str] = None
    featured: bool = False
    date_started: Optional[date] = None
    date_completed: Optional[date] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    tech_stack: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    cover_image_url: Optional[str] = None
    images: Optional[List[str]] = None
    github_url: Optional[str] = None
    live_url: Optional[str] = None
    featured: Optional[bool] = None
    date_started: Optional[date] = None
    date_completed: Optional[date] = None

class ProjectOut(ProjectBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# -------- Profile --------
class ProfileBase(BaseModel):
    name: str
    headline: str
    bio: str
    location: Optional[str] = None
    years_experience: Optional[int] = None
    skills: List[str] = Field(default_factory=list)
    avatar_url: Optional[str] = None
    resume_url: Optional[str] = None
    github: Optional[str] = None
    linkedin: Optional[str] = None
    twitter: Optional[str] = None
    website: Optional[str] = None

class ProfileUpdate(ProfileBase):
    pass

class ProfileOut(ProfileBase):
    id: int

    class Config:
        from_attributes = True


# -------- Inquiry --------
class InquiryBase(BaseModel):
    name: str
    email: EmailStr
    company: Optional[str] = None
    message: str
    attachment_path: Optional[str] = None


class InquiryCreate(InquiryBase):
    pass


class InquiryOut(InquiryBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class InquiryListOut(BaseModel):
    items: List[InquiryOut]
    page: int
    page_size: int
    total: int
    total_pages: int
