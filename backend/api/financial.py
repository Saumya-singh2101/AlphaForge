from fastapi import APIRouter

from agents.financial_agent import FinancialAgent
from models.financial_analysis import FinancialAnalysisResponse

router = APIRouter()

agent = FinancialAgent()

@router.get("/financial/{ticker}", response_model=FinancialAnalysisResponse)
def analyze_company(ticker: str):
    return agent.run(ticker)