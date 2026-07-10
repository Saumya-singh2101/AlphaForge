from typing import TypedDict, Optional, Any


class ReportState(TypedDict):
    ticker: str

    # Each agent writes its output here
    research_output: Optional[str]
    financial_output: Optional[Any]
    news_output: Optional[Any]
    risk_output: Optional[str]
    competitor_output: Optional[Any]
    final_report: Optional[str]
