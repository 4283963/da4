from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class ToolBase(BaseModel):
    name: str = Field(..., min_length=1, description="刀具名称")
    length: float = Field(..., gt=0, description="长度 mm")
    width: float = Field(..., gt=0, description="宽度 mm")
    height: float = Field(..., gt=0, description="高度 mm")
    material: str = Field("硬质合金", description="刀具材料")


class ToolCreate(ToolBase):
    pass


class ToolOut(ToolBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime


class CuttingParamBase(BaseModel):
    tool_id: int = Field(..., gt=0, description="关联刀具 ID")
    cutting_speed: float = Field(..., gt=0, description="切削速度 m/min")
    feed_rate: float = Field(..., gt=0, description="进给量 mm/rev")
    depth_of_cut: float = Field(..., gt=0, description="切深 mm")
    spindle_speed: int = Field(..., gt=0, description="主轴转速 rpm")


class CuttingParamCreate(CuttingParamBase):
    pass


class CuttingParamOut(CuttingParamBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime


class WearRequest(BaseModel):
    cutting_speed: float = Field(..., gt=0)
    feed_rate: float = Field(..., gt=0)
    depth_of_cut: float = Field(..., gt=0)
    cutting_time: float = Field(..., ge=0)


class WearResponse(BaseModel):
    wear_value: float
    wear_percent: float
    status: str


class ApiInfo(BaseModel):
    service: str
    status: str
    version: Optional[str] = None
