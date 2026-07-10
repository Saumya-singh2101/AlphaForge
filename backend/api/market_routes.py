from fastapi import APIRouter
import yfinance as yf

router = APIRouter(tags=["Market"])

WATCHLIST = ["AAPL", "MSFT", "GOOGL", "NVDA", "TSLA", "AMZN", "META", "NFLX"]

@router.get("/market/ticker-tape")
def ticker_tape():
    results = []
    for t in WATCHLIST:
        try:
            info = yf.Ticker(t).info
            price  = info.get("currentPrice") or info.get("regularMarketPrice") or 0
            prev   = info.get("previousClose") or price
            change = round(price - prev, 2)
            pct    = round((change / prev) * 100, 2) if prev else 0
            results.append({
                "ticker":        t,
                "price":         round(price, 2),
                "change":        change,
                "changePercent": pct,
                "positive":      change >= 0,
            })
        except:
            continue
    return results
