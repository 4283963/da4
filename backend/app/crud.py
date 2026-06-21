from typing import Optional

from sqlalchemy.orm import Session

from . import models, schemas


def get_tools(db: Session) -> list[models.Tool]:
    return db.query(models.Tool).order_by(models.Tool.id.desc()).all()


def get_tool(db: Session, tool_id: int) -> Optional[models.Tool]:
    return db.query(models.Tool).filter(models.Tool.id == tool_id).first()


def create_tool(db: Session, tool: schemas.ToolCreate) -> models.Tool:
    db_tool = models.Tool(**tool.model_dump())
    db.add(db_tool)
    db.commit()
    db.refresh(db_tool)
    return db_tool


def delete_tool(db: Session, tool_id: int) -> Optional[models.Tool]:
    tool = get_tool(db, tool_id)
    if tool:
        db.delete(tool)
        db.commit()
    return tool


def get_cutting_params(
    db: Session, tool_id: Optional[int] = None
) -> list[models.CuttingParam]:
    query = db.query(models.CuttingParam)
    if tool_id is not None:
        query = query.filter(models.CuttingParam.tool_id == tool_id)
    return query.order_by(models.CuttingParam.id.desc()).all()


def create_cutting_param(
    db: Session, param: schemas.CuttingParamCreate
) -> models.CuttingParam:
    db_param = models.CuttingParam(**param.model_dump())
    db.add(db_param)
    db.commit()
    db.refresh(db_param)
    return db_param


def delete_cutting_param(db: Session, param_id: int) -> Optional[models.CuttingParam]:
    param = (
        db.query(models.CuttingParam)
        .filter(models.CuttingParam.id == param_id)
        .first()
    )
    if param:
        db.delete(param)
        db.commit()
    return param
