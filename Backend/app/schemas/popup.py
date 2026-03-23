from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from app.models.popup import PopupType, PopupStatus, ShowFrequency


class PopupBase(BaseModel):
    title: str = Field(..., max_length=100, description="弹窗标题")
    content: str = Field(..., description="弹窗内容")
    type: PopupType = Field(default=PopupType.notification, description="弹窗类型")
    status: PopupStatus = Field(default=PopupStatus.active, description="弹窗状态")
    image_url: Optional[str] = Field(None, max_length=500, description="图片URL")
    link_url: Optional[str] = Field(None, max_length=500, description="跳转链接")
    start_time: Optional[datetime] = Field(None, description="开始时间")
    end_time: Optional[datetime] = Field(None, description="结束时间")
    show_frequency: ShowFrequency = Field(default=ShowFrequency.once, description="展示频率")
    max_show_count: Optional[int] = Field(None, ge=0, description="最大展示次数")
    max_click_count: Optional[int] = Field(None, ge=0, description="最大点击次数")
    sort_order: int = Field(default=0, ge=0, description="排序权重")


class PopupCreate(PopupBase):
    pass


class PopupUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=100, description="弹窗标题")
    content: Optional[str] = Field(None, description="弹窗内容")
    type: Optional[PopupType] = Field(None, description="弹窗类型")
    status: Optional[PopupStatus] = Field(None, description="弹窗状态")
    image_url: Optional[str] = Field(None, max_length=500, description="图片URL")
    link_url: Optional[str] = Field(None, max_length=500, description="跳转链接")
    start_time: Optional[datetime] = Field(None, description="开始时间")
    end_time: Optional[datetime] = Field(None, description="结束时间")
    show_frequency: Optional[ShowFrequency] = Field(None, description="展示频率")
    max_show_count: Optional[int] = Field(None, ge=0, description="最大展示次数")
    max_click_count: Optional[int] = Field(None, ge=0, description="最大点击次数")
    sort_order: Optional[int] = Field(None, ge=0, description="排序权重")


class PopupResponse(BaseModel):
    id: int
    title: str
    content: str
    type: PopupType
    status: PopupStatus
    image_url: Optional[str] = None
    link_url: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    show_frequency: ShowFrequency
    max_show_count: Optional[int] = None
    current_show_count: int = 0
    max_click_count: Optional[int] = None
    current_click_count: int = 0
    sort_order: int = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PopupListResponse(BaseModel):
    id: int
    title: str
    content: str
    type: PopupType
    status: PopupStatus
    image_url: Optional[str] = None
    link_url: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    show_frequency: ShowFrequency
    max_show_count: Optional[int] = None
    current_show_count: int = 0
    max_click_count: Optional[int] = None
    current_click_count: int = 0
    sort_order: int = 0
    created_at: datetime

    class Config:
        from_attributes = True


class PopupActiveResponse(BaseModel):
    id: int
    title: str
    content: str
    type: PopupType
    image_url: Optional[str] = None
    link_url: Optional[str] = None
    show_frequency: ShowFrequency

    class Config:
        from_attributes = True


class BatchDeleteRequest(BaseModel):
    ids: List[int] = Field(..., min_length=1, description="弹窗ID列表")


class BatchDeleteResponse(BaseModel):
    success_count: int = 0
    failed_count: int = 0


class SortItem(BaseModel):
    id: int
    sort_order: int


class SortRequest(BaseModel):
    items: List[SortItem] = Field(..., min_length=1, description="排序项列表")
