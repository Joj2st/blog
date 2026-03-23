from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from app.models.media import MediaType


class MediaBase(BaseModel):
    type: MediaType = Field(default=MediaType.image, description="文件类型")


class MediaCreate(MediaBase):
    pass


class UploaderInfo(BaseModel):
    id: int
    nickname: str

    class Config:
        from_attributes = True


class MediaResponse(BaseModel):
    id: int
    filename: str
    original_name: str
    path: str
    url: str
    mime_type: str
    size: int
    width: Optional[int] = None
    height: Optional[int] = None
    type: MediaType
    uploader_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class MediaListResponse(BaseModel):
    id: int
    filename: str
    original_name: str
    url: str
    mime_type: str
    size: int
    width: Optional[int] = None
    height: Optional[int] = None
    type: MediaType
    uploader: Optional[UploaderInfo] = None
    created_at: datetime

    class Config:
        from_attributes = True


class BatchDeleteRequest(BaseModel):
    ids: list[int] = Field(..., min_length=1, description="文件ID列表")


class BatchDeleteResponse(BaseModel):
    success_count: int = 0
    failed_count: int = 0
