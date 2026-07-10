import math
import os
import re
import yfinance as yf
from groq import Groq
from dotenv import load_dotenv
from services.twelve_client import get_quote

load_dotenv()


class CompetitorAgent:

    def __init__(self):
        self.client = Groq(api_key=os.getenv("GROQ_API_KEY"))

    def get_exchange_suffix(self, ticker: str) -> str:
        if "." in ticker:
            return "." + ticker.split(".")[-1]
        return ""

    def get_company_context(self, ticker: str):
        try:
            info = yf.Ticker(ticker).info
            return {
                "name":     info.get("longName"),
                "sector":   info.get("sector"),
                "industry": info.get("industry"),
                "country":  info.get("country"),
                "exchange": info.get("exchange"),
            }
        except Exception:
            return {"name": ticker, "sector": None, "industry": None, "country": None, "exchange": None}

    def get_ai_competitors(self, company_context: dict, exchange_suffix: str):
        suffix_map = {
            ".NS": "Indian NSE stocks — append .NS (e.g. HDFCBANK.NS, INFY.NS, WIPRO.NS)",
            ".BO": "Indian BSE stocks — append .BO",
            ".L":  "London Stock Exchange — append .L",
            ".DE": "Frankfurt/XETRA — append .DE",
            ".T":  "Tokyo Stock Exchange — append .T",
            ".HK": "Hong Kong Exchange — append .HK",
            "":    "US stocks NYSE/NASDAQ — no suffix",
        }
        suffix_instruction = suffix_map.get(exchange_suffix, "No suffix needed")

        prompt = f"""Return ONLY 5 real competitor stock tickers for this company.
{suffix_instruction}
Comma separated, single line. Real listed tickers only. No names, no explanation.

Company: {company_context['name']}
Sector: {company_context['sector']}
Industry: {company_context['industry']}
Country: {company_context['country']}"""

        response = self.client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": f"Output only comma-separated real stock tickers. {suffix_instruction}"},
                {"role": "user",   "content": prompt}
            ]
        )

        result  = response.choices[0].message.content.strip()
        tickers = []
        for part in result.split(","):
            part  = part.strip()
            match = re.search(r'\(([A-Z0-9\-\.]+)\)', part)
            if match:
                tickers.append(match.group(1))
            else:
                clean = re.sub(r'[^A-Z0-9\.\-]', '', part.upper())
                if clean:
                    if exchange_suffix and "." not in clean:
                        clean += exchange_suffix
                    tickers.append(clean)
        return tickers[:5]

    def clean(self, val):
        if isinstance(val, float) and math.isnan(val):
            return None
        return val

    def get_metrics(self, tickers: list):
        results = []
        for t in tickers:
            try:
                info = yf.Ticker(t).info
                if not info or not info.get("regularMarketPrice") and not info.get("currentPrice"):
                    continue

                # Try Twelve Data for price, fallback to yfinance
                try:
                    quote    = get_quote(t)
                    currency = quote.get("currency", "USD")
                except Exception:
                    currency = info.get("currency", "USD")

                financials   = yf.Ticker(t).financials
                info_revenue = info.get("totalRevenue")

                try:
                    rev = int(financials.loc["Total Revenue"].iloc[0])
                    if info_revenue:
                        ratio = rev / info_revenue
                        if ratio > 3 or ratio < 0.33:
                            rev = info_revenue
                    market_cap = self.clean(info.get("marketCap"))
                    if rev and market_cap and rev > market_cap * 5:
                        rev = None
                except Exception:
                    rev = info_revenue

                results.append({
                    "ticker":     t,
                    "revenue":    rev,
                    "market_cap": self.clean(info.get("marketCap")),
                    "pe_ratio":   self.clean(info.get("trailingPE")),
                    "roe":        self.clean(info.get("returnOnEquity")),
                    "currency":   currency,
                })
            except Exception:
                continue
        return results

    def compare(self, ticker: str):
        context         = self.get_company_context(ticker)
        exchange_suffix = self.get_exchange_suffix(ticker)
        competitors     = self.get_ai_competitors(context, exchange_suffix)
        all_companies   = [ticker.upper()] + competitors
        metrics         = self.get_metrics(all_companies)
        return {
            "base_company": ticker.upper(),
            "context":      context,
            "comparison":   metrics
        }
