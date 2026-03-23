import enum
from datetime import datetime
from sqlalchemy import Column, BigInteger, String, Text, DateTime, Enum, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base


class CommentStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    spam = "spam"
    trash = "trash"


class Comment(Base):
    __tablename__ = "comments"

    id = Column(BigInteger, primary_key=True, autoincrement=True, index=True)
    article_id = Column(BigInteger, ForeignKey("articles.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    parent_id = Column(BigInteger, ForeignKey("comments.id", ondelete="CASCADE"), nullable=True, index=True)
    reply_to_id = Column(BigInteger, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    content = Column(Text, nullable=False)
    status = Column(Enum(CommentStatus), default=CommentStatus.pending, nullable=False, index=True)
    ip_address = Column(String(50), nullable=True)
    user_agent = Column(String(500), nullable=True)
    like_count = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    article = relationship("Article", backref="comments")
    user = relationship("User", foreign_keys=[user_id], backref="comments")
    parent = relationship("Comment", remote_side=[id], backref="replies")
    reply_to = relationship("User", foreign_keys=[reply_to_id])
