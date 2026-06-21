from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import crud, schemas
from ..database import get_db

router = APIRouter(tags=["tools"])


@router.get("/tools", response_model=list[schemas.ToolOut])
def list_tools(db: Session = Depends(get_db)):
    return crud.get_tools(db)


@router.post("/tools", response_model=schemas.ToolOut, status_code=201)
def create_tool(tool: schemas.ToolCreate, db: Session = Depends(get_db)):
    return crud.create_tool(db, tool)


@router.get("/tools/{tool_id}", response_model=schemas.ToolOut)
def read_tool(tool_id: int, db: Session = Depends(get_db)):
    tool = crud.get_tool(db, tool_id)
    if not tool:
        raise HTTPException(status_code=404, detail="刀具不存在")
    return tool


@router.delete("/tools/{tool_id}", status_code=204)
def delete_tool(tool_id: int, db: Session = Depends(get_db)):
    tool = crud.delete_tool(db, tool_id)
    if not tool:
        raise HTTPException(status_code=404, detail="刀具不存在")
    return None
