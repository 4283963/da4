from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, Text
from sqlalchemy.orm import relationship

from .database import Base


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Tool(Base):
    __tablename__ = "tools"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(Text, nullable=False)
    length = Column(Float, nullable=False)
    width = Column(Float, nullable=False)
    height = Column(Float, nullable=False)
    material = Column(Text, nullable=False, default="硬质合金")
    created_at = Column(DateTime, default=_utcnow)

    params = relationship(
        "CuttingParam",
        back_populates="tool",
        cascade="all, delete-orphan",
    )


class CuttingParam(Base):
    __tablename__ = "cutting_params"

    id = Column(Integer, primary_key=True, autoincrement=True)
    tool_id = Column(Integer, ForeignKey("tools.id", ondelete="CASCADE"), nullable=False)
    cutting_speed = Column(Float, nullable=False)
    feed_rate = Column(Float, nullable=False)
    depth_of_cut = Column(Float, nullable=False)
    spindle_speed = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=_utcnow)

    tool = relationship("Tool", back_populates="params")
