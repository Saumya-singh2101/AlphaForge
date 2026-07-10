from fastapi import APIRouter
from agents.competitor_agent import CompetitorAgent

router = APIRouter()

agent = CompetitorAgent()


@router.get("/compare/{ticker}")
def compare_company(ticker: str):
    return agent.compare(ticker)