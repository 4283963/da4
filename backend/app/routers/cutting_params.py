from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from .. import crud, schemas
from ..database import get_db

router = APIRouter(tags=["cutting-params"])


@router.get("/cutting-params", response_model=list[schemas.CuttingParamOut])
def list_params(
    tool_id: Optional[int] = Query(default=None, description="按刀具 ID 过滤"),
    db: Session = Depends(get_db),
):
    return crud.get_cutting_params(db, tool_id=tool_id)


@router.post("/cutting-params", response_model=schemas.CuttingParamOut, status_code=201)
def create_param(
    param: schemas.CuttingParamCreate,
    db: Session = Depends(get_db),
):
    if not crud.get_tool(db, param.tool_id):
        raise HTTPException(status_code=404, detail="关联的刀具不存在")
    return crud.create_cutting_param(db, param)


@router.delete("/cutting-params/{param_id}", status_code=204)
def delete_param(param_id: int, db: Session = Depends(get_db)):
    param = crud.delete_cutting_param(db, param_id)
    if not param:
        raise HTTPException(status_code=404, detail="切削参数不存在")
    return None
