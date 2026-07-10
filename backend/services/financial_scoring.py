def calculate_financial_score(
    revenue,
    net_income,
    roe,
    debt,
    cash_flow,
    pe_ratio
):
    score = 5.0  # start neutral baseline (IMPORTANT)

    positive_signals = []
    negative_signals = []

    # Profitability check
    if net_income and net_income > 0:
        score += 1.5
        positive_signals.append("Company is profitable")
    else:
        score -= 1.5
        negative_signals.append("Company is not profitable")

    # ROE check
    if roe:
        if roe > 0.15:
            score += 1.0
            positive_signals.append("High ROE (efficient capital usage)")
        elif roe < 0.05:
            score -= 0.5
            negative_signals.append("Low ROE (inefficient management)")

    # Debt check
    if debt:
        if debt > 1_000_000_000_000:  # 1 trillion threshold (simplified)
            score -= 1.5
            negative_signals.append("High debt burden")
        else:
            score += 0.5
            positive_signals.append("Manageable debt levels")

    # Cash flow check
    if cash_flow and cash_flow > 0:
        score += 1.5
        positive_signals.append("Positive operating cash flow")
    else:
        score -= 1.0
        negative_signals.append("Weak or negative cash flow")

    # Clamp score between 0 and 10
    score = max(0, min(10, score))

    # Risk classification
    if score >= 7:
        risk_level = "Low"
    elif score >= 4:
        risk_level = "Medium"
    else:
        risk_level = "High"

    return {
        "financial_health_score": round(score, 2),
        "positive_signals": positive_signals,
        "negative_signals": negative_signals,
        "risk_level": risk_level
    }