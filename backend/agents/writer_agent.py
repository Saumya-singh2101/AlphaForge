from graph.state import ReportState
import json


class WriterAgent:
    """
    Final node in the LangGraph pipeline.
    Reads ALL agent outputs and writes the final investment report.
    Writes to state["final_report"].
    """

    def __init__(self, llm):
        self.llm = llm

    def _serialize(self, data) -> str:
        if data is None:
            return "No data available."
        if isinstance(data, str):
            return data
        if hasattr(data, "dict"):          # Pydantic model
            return json.dumps(data.dict(), indent=2, default=str)
        if isinstance(data, (dict, list)):
            return json.dumps(data, indent=2, default=str)
        return str(data)

    def run(self, state: ReportState) -> ReportState:
        ticker = state["ticker"]

        research    = self._serialize(state.get("research_output"))
        financial   = self._serialize(state.get("financial_output"))
        news        = self._serialize(state.get("news_output"))
        risk        = self._serialize(state.get("risk_output"))
        competitors = self._serialize(state.get("competitor_output"))

        prompt = f"""You are a Managing Director at Goldman Sachs Equity Research.

Write a comprehensive, professional investment report for {ticker}.

Use ONLY the data provided below. Do not fabricate any numbers.

---
RESEARCH DATA:
{research}

FINANCIAL DATA:
{financial}

NEWS ANALYSIS:
{news}

RISK ASSESSMENT:
{risk}

COMPETITOR ANALYSIS:
{competitors}
---

Write the report in this exact structure:

# {ticker} — Equity Research Report

## 1. Executive Summary
(3-4 sentences: what the company does, financial health snapshot, recommendation)

## 2. Business Overview
(Sector, industry, business model, competitive position)

## 3. Financial Health
(Key metrics: revenue, net income, EPS, P/E, debt, cash flow — with analysis)

## 4. News & Sentiment Analysis
(Recent news impact on stock, sentiment trend)

## 5. Competitive Landscape
(How {ticker} stacks up vs competitors on key metrics)

## 6. Risk Factors
(Pull from risk assessment — structured and prioritized)

## 7. Valuation & Recommendation
- **Rating**: BUY / HOLD / SELL
- **Target Price**: (based on analyst consensus from research data)
- **Investment Thesis**: (2-3 sentences — bull case)
- **Key Risks to Thesis**: (1-2 sentences)

---
Rules:
- Clean Markdown only
- Bold key numbers
- No raw JSON dumps
- No filler phrases like "it is worth noting"
- Write like a real analyst, not a chatbot"""

        response = self.llm.invoke(prompt)
        report = response.content if hasattr(response, "content") else str(response)

        return {**state, "final_report": report}
