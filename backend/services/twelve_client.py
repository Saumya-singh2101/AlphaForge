import os
import requests
from dotenv import load_dotenv

load_dotenv()

API_KEY  = os.getenv("TWELVE_DATA_API_KEY")
BASE_URL = "https://api.twelvedata.com"


def td_get(endpoint: str, params: dict) -> dict:
    params["apikey"] = API_KEY
    res  = requests.get(f"{BASE_URL}/{endpoint}", params=params, timeout=15)
    data = res.json()
    if data.get("status") == "error":
        raise ValueError(f"Twelve Data error: {data.get('message')}")
    return data


def get_quote(ticker: str) -> dict:
    """Real-time quote — price, change, 52W high/low."""
    return td_get("quote", {"symbol": ticker})


def get_time_series(ticker: str, interval: str = "1day", outputsize: int = 1260) -> dict:
    """5 years of daily historical price data."""
    return td_get("time_series", {
        "symbol":     ticker,
        "interval":   interval,
        "outputsize": outputsize,
    })
