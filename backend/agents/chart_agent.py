import yfinance as yf
from services.twelve_client import get_time_series


class ChartAgent:

    def run(self, ticker: str):

        # ── Stock price history from Twelve Data (reliable) ──
        stock_price = []
        try:
            ts = get_time_series(ticker, interval="1day", outputsize=1260)
            for bar in reversed(ts.get("values", [])):
                stock_price.append({
                    "date":  bar.get("datetime"),
                    "close": round(float(bar.get("close", 0)), 2)
                })
        except Exception:
            # Fallback to yfinance
            try:
                hist = yf.Ticker(ticker).history(period="5y")
                for date, row in hist.iterrows():
                    stock_price.append({
                        "date":  str(date.date()),
                        "close": round(float(row["Close"]), 2)
                    })
            except Exception:
                pass

        # ── Fundamentals from yfinance (free) ──
        revenue        = []
        profit         = []
        free_cash_flow = []
        ebitda         = []

        try:
            stock      = yf.Ticker(ticker)
            financials = stock.financials
            cashflow   = stock.cashflow

            def extract(df, metric):
                try:
                    row  = df.loc[metric]
                    data = []
                    for date, value in row.items():
                        if value is not None:
                            try:
                                data.append({
                                    "year":  str(date.year),
                                    "value": float(value)
                                })
                            except Exception:
                                pass
                    return sorted(data, key=lambda x: x["year"])
                except Exception:
                    return []

            revenue        = extract(financials, "Total Revenue")
            profit         = extract(financials, "Net Income")
            ebitda         = extract(financials, "EBITDA")
            free_cash_flow = extract(cashflow,   "Free Cash Flow")

            # Cross-validate revenue — same fix as before
            info         = stock.info
            info_revenue = info.get("totalRevenue")
            if revenue and info_revenue:
                latest = revenue[-1]["value"] if revenue else None
                if latest and info_revenue:
                    ratio = latest / info_revenue
                    if ratio > 3 or ratio < 0.33:
                        # Rebuild revenue from info value as single point
                        revenue = [{"year": str(revenue[-1]["year"]), "value": float(info_revenue)}] if revenue else []

        except Exception:
            pass

        return {
            "ticker":         ticker.upper(),
            "revenue":        revenue,
            "profit":         profit,
            "free_cash_flow": free_cash_flow,
            "ebitda":         ebitda,
            "stock_price":    stock_price,
        }
