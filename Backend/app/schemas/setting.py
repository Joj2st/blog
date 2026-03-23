from datetime import datetime
from typing import Optional, Any, Dict
from pydantic import BaseModel, Field


class SettingsResponse(BaseModel):
    site_name: str = "我的博客"
    site_description: Optional[str] = None
    site_keywords: Optional[str] = None
    site_logo: Optional[str] = None
    site_favicon: Optional[str] = None
    site_icp: Optional[str] = None
    comment_enabled: bool = True
    comment_audit: bool = True
    register_enabled: bool = True
    email_notify: bool = False
    footer_text: Optional[str] = None
    social_links: Optional[Dict[str, str]] = None


class SettingsUpdate(BaseModel):
    site_name: Optional[str] = Field(None, max_length=100)
    site_description: Optional[str] = Field(None, max_length=500)
    site_keywords: Optional[str] = Field(None, max_length=200)
    site_logo: Optional[str] = Field(None, max_length=500)
    site_favicon: Optional[str] = Field(None, max_length=500)
    site_icp: Optional[str] = Field(None, max_length=100)
    comment_enabled: Optional[bool] = None
    comment_audit: Optional[bool] = None
    register_enabled: Optional[bool] = None
    email_notify: Optional[bool] = None
    footer_text: Optional[str] = Field(None, max_length=500)
    social_links: Optional[Dict[str, str]] = None


class SettingItem(BaseModel):
    key: str
    value: Any
    type: str
    description: Optional[str] = None

    class Config:
        from_attributes = True
