import yfinance as yf
from fastapi import APIRouter

router = APIRouter()

DEFAULT_TICKERS = ["NVDA", "AAPL", "AMD", "TSLA", "MSFT", "GOOGL", "META", "AMZN", "INTC", "QCOM"]


@router.get("/quotes")
def quotes(symbols: str = ",".join(DEFAULT_TICKERS)):
    """Returns latest price + % change for a comma-separated list of tickers.
    Example: /quotes?symbols=NVDA,AAPL,TSLA
    """
    tickers = [s.strip().upper() for s in symbols.split(",") if s.strip()]
    results = []

    for sym in tickers:
        try:
            t = yf.Ticker(sym)
            hist = t.history(period="2d")
            if hist.empty or len(hist) < 1:
                continue
            last_close = float(hist["Close"].iloc[-1])
            prev_close = float(hist["Close"].iloc[-2]) if len(hist) > 1 else last_close
            change_pct = ((last_close - prev_close) / prev_close) * 100 if prev_close else 0
            results.append({
                "symbol": sym,
                "price": round(last_close, 2),
                "change_pct": round(change_pct, 2),
                "up": change_pct >= 0,
            })
        except Exception:
            continue

    return {"quotes": results}
