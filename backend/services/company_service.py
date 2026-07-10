import yfinance as yf
from services.twelve_client import get_quote
from models.company import CompanyResponse


def get_company_details(ticker: str) -> CompanyResponse:

    # ── Price data from Twelve Data (reliable) ──
    try:
        quote         = get_quote(ticker)
        current_price = float(quote.get("close") or quote.get("previous_close") or 0)
        previous_close= float(quote.get("previous_close") or current_price)
        change        = float(quote.get("change") or 0)
        change_pct    = float(quote.get("percent_change") or 0)
        currency      = quote.get("currency", "USD")
        fifty_two_high= float(quote.get("fifty_two_week", {}).get("high") or 0) or None
        fifty_two_low = float(quote.get("fifty_two_week", {}).get("low")  or 0) or None
        company_name  = quote.get("name", ticker.upper())
        exchange      = quote.get("exchange", "Unknown")
    except Exception:
        # Fallback to yfinance price if Twelve Data fails
        info          = yf.Ticker(ticker).info
        current_price = float(info.get("currentPrice") or info.get("regularMarketPrice") or 0)
        previous_close= float(info.get("previousClose") or current_price)
        change        = round(current_price - previous_close, 4)
        change_pct    = round((change / previous_close) * 100, 4) if previous_close else 0
        currency      = info.get("currency", "USD")
        fifty_two_high= info.get("fiftyTwoWeekHigh")
        fifty_two_low = info.get("fiftyTwoWeekLow")
        company_name  = info.get("longName") or ticker.upper()
        exchange      = info.get("exchange", "Unknown")

    # ── Company profile from yfinance (free) ──
    info = yf.Ticker(ticker).info

    currency_symbol = {
        "INR": "₹", "GBP": "£", "EUR": "€",
        "JPY": "¥", "HKD": "HK$", "USD": "$",
        "CAD": "C$", "AUD": "A$",
    }.get(currency, currency + " ")

    market_cap = info.get("marketCap") or info.get("totalAssets") or 0

    return CompanyResponse(
        ticker=ticker.upper(),
        company_name=info.get("longName") or company_name,
        exchange=info.get("exchange") or exchange,
        sector=info.get("sector") or "Unknown",
        industry=info.get("industry") or "Unknown",
        country=info.get("country") or "Unknown",
        currency=currency,
        currency_symbol=currency_symbol,
        current_price=current_price,
        previous_close=previous_close,
        change=change,
        change_percent=change_pct,
        market_cap=market_cap,
        pe_ratio=info.get("trailingPE"),
        fifty_two_week_high=fifty_two_high or info.get("fiftyTwoWeekHigh"),
        fifty_two_week_low=fifty_two_low  or info.get("fiftyTwoWeekLow"),
        description=info.get("longBusinessSummary") or "",
        employees=info.get("fullTimeEmployees"),
        website=info.get("website") or "",
        analyst_target=info.get("targetMeanPrice"),
        recommendation=info.get("recommendationKey") or "",
    )
