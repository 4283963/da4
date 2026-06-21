import math

CRITICAL_VB = 0.3  # 后刀面磨钝标准 VB(mm)


def estimate_wear(
    cutting_speed: float,
    feed_rate: float,
    depth_of_cut: float,
    cutting_time: float,
) -> dict:
    """简化的刀具后刀面磨损估算模型。

    VB = K * Vc * sqrt(f) * sqrt(ap) * t
    切削速度与未变形切屑厚度对磨损呈正相关，随切削时长线性累积。
    """
    vb = (
        0.0009
        * cutting_speed
        * math.sqrt(max(feed_rate, 1e-6))
        * math.sqrt(max(depth_of_cut, 1e-6))
        * cutting_time
    )
    vb = min(vb, CRITICAL_VB * 1.6)

    percent = min(100.0, (vb / CRITICAL_VB) * 100.0)
    if percent < 60.0:
        status = "normal"
    elif percent < 90.0:
        status = "warning"
    else:
        status = "critical"

    return {
        "wear_value": round(vb, 4),
        "wear_percent": round(percent, 1),
        "status": status,
    }
