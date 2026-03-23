import enum
from datetime import datetime
from sqlalchemy import Column, BigInteger, String, DateTime, Enum, Integer, Text, Boolean
from sqlalchemy.orm import relationship
from app.db.base_class import Base


class PopupType(str, enum.Enum):
    notification = "notification"
    advertisement = "advertisement"


class PopupStatus(str, enum.Enum):
    active = "active"
    inactive = "inactive"
    expired = "expired"


class ShowFrequency(str, enum.Enum):
    once = "once"
    daily = "daily"
    always = "always"


class Popup(Base):
    __tablename__ = "popups"

    id = Column(BigInteger, primary_key=True, autoincrement=True, index=True)
    title = Column(String(100), nullable=False)
    content = Column(Text, nullable=False)
    type = Column(Enum(PopupType), default=PopupType.notification, nullable=False, index=True)
    status = Column(Enum(PopupStatus), default=PopupStatus.active, nullable=False, index=True)
    image_url = Column(String(500), nullable=True)
    link_url = Column(String(500), nullable=True)
    start_time = Column(DateTime, nullable=True, index=True)
    end_time = Column(DateTime, nullable=True, index=True)
    show_frequency = Column(Enum(ShowFrequency), default=ShowFrequency.once, nullable=False)
    max_show_count = Column(Integer, nullable=True)
    current_show_count = Column(Integer, default=0, nullable=False)
    max_click_count = Column(Integer, nullable=True)
    current_click_count = Column(Integer, default=0, nullable=False)
    sort_order = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
