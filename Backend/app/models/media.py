import enum
from datetime import datetime
from sqlalchemy import Column, BigInteger, String, DateTime, Enum, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base


class MediaType(str, enum.Enum):
    image = "image"
    document = "document"


class Media(Base):
    __tablename__ = "media"

    id = Column(BigInteger, primary_key=True, autoincrement=True, index=True)
    filename = Column(String(255), nullable=False)
    original_name = Column(String(255), nullable=False)
    path = Column(String(500), nullable=False)
    url = Column(String(500), nullable=False)
    mime_type = Column(String(100), nullable=False)
    size = Column(BigInteger, nullable=False)
    width = Column(Integer, nullable=True)
    height = Column(Integer, nullable=True)
    type = Column(Enum(MediaType), default=MediaType.image, nullable=False, index=True)
    uploader_id = Column(BigInteger, ForeignKey("users.id"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    uploader = relationship("User", backref="media_files")
