from pydantic import BaseModel
from typing import List, Dict, Optional

class FinancialAnalysisResponse(BaseModel):
    ticker: str

    # Currency the core metrics below are denominated in (e.g. "USD", "INR").
    # Comes from yfinance's financialCurrency/currency fields. Frontend uses
    # this to render the correct symbol instead of assuming USD.
    currency: str = "USD"

    # core metrics (raw data layer)
    revenue: Optional[int]
    net_income: Optional[int]
    eps: Optional[float]
    roe: Optional[float]
    debt: Optional[int]
    cash_flow: Optional[int]
    pe_ratio: Optional[float]

    # 🧠 AI reasoning layer (NEW)
    financial_health_score: float  # 0 to 10

    summary: str  # human-like explanation

    positive_signals: List[str]
    negative_signals: List[str]

    risk_level: str  # Low / Medium / High