from fastapi import APIRouter

from .. import schemas
from ..simulation import estimate_wear

router = APIRouter(tags=["simulation"])


@router.post("/simulation/wear", response_model=schemas.WearResponse)
def estimate(param: schemas.WearRequest):
    result = estimate_wear(
        cutting_speed=param.cutting_speed,
        feed_rate=param.feed_rate,
        depth_of_cut=param.depth_of_cut,
        cutting_time=param.cutting_time,
    )
    return result
