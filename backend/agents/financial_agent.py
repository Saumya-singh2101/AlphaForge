import logging
import yfinance as yf
from services.twelve_client import get_quote
from services.financial_scoring import calculate_financial_score
from models.financial_analysis import FinancialAnalysisResponse

logger = logging.getLogger(__name__)

ROW_ALIASES = {
    "revenue":    ["Total Revenue"],
    "net_income": ["Net Income"],
    "debt":       ["Total Debt"],
    "cash_flow":  [
        "Total Cash From Operating Activities",
        "Operating Cash Flow",
        "Cash Flow From Continuing Operating Activities",
    ],
    "equity": [
        "Total Stockholder Equity",
        "Stockholders Equity",
        "Common Stock Equity",
    ],
}


class FinancialAgent:

    def run(self, ticker: str) -> FinancialAnalysisResponse:
        stock         = yf.Ticker(ticker)
        info          = stock.info
        financials    = stock.financials
        balance_sheet = stock.balance_sheet
        cashflow      = stock.cashflow

        def safe_get(df, row_candidates):
            if isinstance(row_candidates, str):
                row_candidates = [row_candidates]
            for row in row_candidates:
                try:
                    val = df.loc[row].iloc[0]
                    if val is not None:
                        return int(val)
                except Exception:
                    continue
            return None

        revenue    = safe_get(financials,    ROW_ALIASES["revenue"])
        net_income = safe_get(financials,    ROW_ALIASES["net_income"])
        debt       = safe_get(balance_sheet, ROW_ALIASES["debt"])
        cash_flow  = safe_get(cashflow,      ROW_ALIASES["cash_flow"])
        equity     = safe_get(balance_sheet, ROW_ALIASES["equity"])
        eps        = info.get("trailingEps")
        pe_ratio   = info.get("trailingPE")

        # ── Currency ──
        try:
            quote    = get_quote(ticker)
            currency = quote.get("currency", "USD")
        except Exception:
            currency = info.get("currency", "USD")

        # ── ROE ──
        roe = None
        if net_income and equity and equity != 0:
            roe = round(net_income / equity, 4)

        # ── Cross-validate revenue ──
        info_revenue = info.get("totalRevenue")
        if revenue and info_revenue:
            ratio = revenue / info_revenue
            if ratio > 3 or ratio < 0.33:
                logger.warning("Revenue mismatch for %s — using info value", ticker)
                revenue = info_revenue

        # ── Sanity check ──
        market_cap = info.get("marketCap")
        if revenue and market_cap and market_cap > 0:
            if revenue > market_cap * 5:
                revenue = None
        if net_income and market_cap and market_cap > 0:
            if abs(net_income) > market_cap * 2:
                net_income = None

        score_data = calculate_financial_score(
            revenue, net_income, roe, debt, cash_flow, pe_ratio
        )

        return FinancialAnalysisResponse(
            ticker=ticker.upper(),
            currency=currency,
            revenue=revenue,
            net_income=net_income,
            eps=eps,
            roe=roe,
            debt=debt,
            cash_flow=cash_flow,
            pe_ratio=pe_ratio,
            financial_health_score=score_data["financial_health_score"],
            positive_signals=score_data["positive_signals"],
            negative_signals=score_data["negative_signals"],
            risk_level=score_data["risk_level"],
            summary=self._generate_summary(score_data)
        )

    def _generate_summary(self, score_data):
        score = score_data["financial_health_score"]
        if score >= 7:
            return "Strong financial position with healthy fundamentals and stable cash flows."
        elif score >= 4:
            return "Moderate financial health with mixed signals in profitability and debt."
        else:
            return "Weak financial position with potential risk in profitability or leverage."
