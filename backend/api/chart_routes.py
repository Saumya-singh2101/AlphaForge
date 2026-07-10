import math

from fastapi import APIRouter

from agents.chart_agent import ChartAgent

router = APIRouter()

agent = ChartAgent()


def clean_nan(obj):
    """Recursively replace NaN/Infinity floats with None so the
    response is valid JSON (json.dumps fails on NaN otherwise)."""
    if isinstance(obj, dict):
        return {k: clean_nan(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [clean_nan(v) for v in obj]
    if isinstance(obj, float) and (math.isnan(obj) or math.isinf(obj)):
        return None
    return obj


@router.get("/charts/{ticker}")
def charts(ticker: str):
    result = agent.run(ticker)
    return clean_nan(result)