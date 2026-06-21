from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import crud, models, schemas
from .database import Base, SessionLocal, engine
from .routers import cutting_params, simulation, tools


def _seed() -> None:
    db = SessionLocal()
    try:
        if db.query(models.Tool).first():
            return
        t1 = crud.create_tool(
            db,
            schemas.ToolCreate(
                name="CNMG120408 硬质合金刀片",
                length=40,
                width=12,
                height=16,
                material="硬质合金",
            ),
        )
        crud.create_cutting_param(
            db,
            schemas.CuttingParamCreate(
                tool_id=t1.id,
                cutting_speed=120,
                feed_rate=0.2,
                depth_of_cut=1.0,
                spindle_speed=1500,
            ),
        )
        t2 = crud.create_tool(
            db,
            schemas.ToolCreate(
                name="CBN 立方氮化硼刀片",
                length=35,
                width=10,
                height=14,
                material="立方氮化硼",
            ),
        )
        crud.create_cutting_param(
            db,
            schemas.CuttingParamCreate(
                tool_id=t2.id,
                cutting_speed=200,
                feed_rate=0.15,
                depth_of_cut=0.8,
                spindle_speed=2200,
            ),
        )
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    _seed()
    yield


app = FastAPI(
    title="刀具磨损几何干涉模拟器 API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tools.router, prefix="/api")
app.include_router(cutting_params.router, prefix="/api")
app.include_router(simulation.router, prefix="/api")


@app.get("/", response_model=schemas.ApiInfo)
def root():
    return {"service": "wear-sim-api", "status": "ok", "version": "1.0.0"}
