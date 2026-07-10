from graph.state import ReportState


class RiskAgent:
    """
    Node 4 in the LangGraph pipeline.
    Reads research, financial, and news outputs.
    Uses LLM to identify and score risks.
    Writes to state["risk_output"].
    """

    def __init__(self, llm):
        self.llm = llm

    def run(self, state: ReportState) -> ReportState:
        ticker = state["ticker"]

        research   = state.get("research_output", "")
        financial  = state.get("financial_output", "")
        news       = state.get("news_output", "")

        prompt = f"""You are a senior risk analyst at a top hedge fund.

Based on the data below, identify ALL material risks for {ticker}.

COMPANY RESEARCH:
{research}

FINANCIAL DATA:
{financial}

RECENT NEWS:
{news}

Provide a structured risk report with:

## Risk Assessment — {ticker}

### 1. Financial Risks
- (list each risk with severity: Low / Medium / High)

### 2. Market & Macro Risks
- (list each risk with severity)

### 3. Operational & Business Risks
- (list each risk with severity)

### 4. News-Driven Risks
- (list each risk with severity)

### Overall Risk Rating
[LOW / MEDIUM / HIGH] — with 2 sentence justification.

Be specific, use numbers from the financial data where possible.
No fluff. Analyst-quality output only."""

        response = self.llm.invoke(prompt)
        risk_text = response.content if hasattr(response, "content") else str(response)

        return {**state, "risk_output": risk_text}
