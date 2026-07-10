from services.data_service import get_stock_data

def build_report_prompt(symbol: str, data: dict):
    return f"""
You are a senior equity research analyst.

Create a professional investment research report.

Structure:

1. Executive Summary
2. Business Overview
3. Financial Health
4. Growth Opportunities
5. Risks
6. Competitor Analysis
7. Recommendation (BUY / HOLD / SELL)

Company: {symbol}

Raw Data:
{data}

Rules:
- Professional tone like Morgan Stanley report
- Structured Markdown output
- No unnecessary explanation
"""


def generate_report(symbol: str, llm):
    data = get_stock_data(symbol)

    prompt = build_report_prompt(symbol, data)

    response = llm.invoke(prompt)

    return response