import yfinance as yf
from graph.state import ReportState


class ResearchAgent:
    """
    Node 1 in the LangGraph pipeline.
    Fetches company background, sector, description, and key metadata.
    Writes to state["research_output"].
    """

    def run(self, state: ReportState) -> ReportState:
        ticker = state["ticker"]

        try:
            stock = yf.Ticker(ticker)
            info = stock.info

            research = f"""
COMPANY RESEARCH — {ticker}
============================
Name        : {info.get("longName", "N/A")}
Sector      : {info.get("sector", "N/A")}
Industry    : {info.get("industry", "N/A")}
Country     : {info.get("country", "N/A")}
Employees   : {info.get("fullTimeEmployees", "N/A")}
Market Cap  : {info.get("marketCap", "N/A")}
52W High    : {info.get("fiftyTwoWeekHigh", "N/A")}
52W Low     : {info.get("fiftyTwoWeekLow", "N/A")}
Analyst Target Price: {info.get("targetMeanPrice", "N/A")}

Business Summary:
{info.get("longBusinessSummary", "No description available.")}
""".strip()

        except Exception as e:
            research = f"Research failed for {ticker}: {str(e)}"

        return {**state, "research_output": research}
