from agents.financial_agent import FinancialAgent
from agents.news_agent import NewsAgent
from agents.competitor_agent import CompetitorAgent


class ReportAgent:

    def __init__(self, llm):
        self.financial = FinancialAgent()
        self.news = NewsAgent()
        self.competitor = CompetitorAgent()
        self.llm = llm

    def generate_report(self, ticker: str):

        ticker = ticker.upper()

        financial_data = self.financial.run(ticker)
        news_data = self.news.run(ticker)

        # ✅ FIX: pass STRING not list
        competitors = self.competitor.compare(ticker)

        prompt = f"""
You are a senior equity research analyst.

Create a professional investment report.

1. Executive Summary
2. Business Overview
3. Financial Health
4. News Impact
5. Competitor Analysis
6. Risks
7. Recommendation

TICKER: {ticker}

FINANCIAL:
{financial_data}

NEWS:
{news_data}

COMPETITORS:
{competitors}

Rules:
- Clean Markdown
- No raw dumps
"""

        report = self.llm.invoke(prompt)

        return {
            "ticker": ticker,
            "report": report.content if hasattr(report, "content") else report,
            "raw_data": {
                "financial": financial_data,
                "news": news_data,
                "competitors": competitors
            }
        }