import os
import re
import yfinance as yf
from groq import Groq
from dotenv import load_dotenv
from services.twelve_client import get_quote

load_dotenv()


class ChatAgent:

    def __init__(self):
        self.client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        self.system_prompt = """You are AlphaForge AI — a world-class financial analyst and investment advisor.

You can answer ANYTHING related to stocks, investing, and finance:
- "Should I invest in AAPL?"
- "If I put $60 in AAPL today, how much can I expect in 1 year?"
- "Is AAPL better than MSFT?"
- "What are the risks?"
- "What's a good entry point?"
- "Explain P/E ratio to me"

Your personality:
- Talk like a smart friend who happens to be a Goldman Sachs analyst
- Give REAL opinions — never dodge with "consult a financial advisor"
- Back claims with numbers whenever possible
- Be conversational, not robotic
- Keep responses concise but insightful

For price predictions / "how much will I make":
- Use realistic analyst estimates, historical CAGR, and current valuation
- Give a range (bear / base / bull case)
- Always mention key risks

Remember the full conversation history."""

    def get_live_data(self, ticker: str) -> str:
        try:
            # Price from Twelve Data
            quote = get_quote(ticker)
            price = quote.get("close", "N/A")
            chg   = quote.get("change", "N/A")
            pct   = quote.get("percent_change", "N/A")
            high  = quote.get("fifty_two_week", {}).get("high", "N/A")
            low   = quote.get("fifty_two_week", {}).get("low",  "N/A")
            curr  = quote.get("currency", "USD")
            name  = quote.get("name", ticker)
        except Exception:
            # Fallback to yfinance
            try:
                info  = yf.Ticker(ticker).info
                price = info.get("currentPrice") or info.get("regularMarketPrice", "N/A")
                chg   = info.get("regularMarketChange", "N/A")
                pct   = info.get("regularMarketChangePercent", "N/A")
                high  = info.get("fiftyTwoWeekHigh", "N/A")
                low   = info.get("fiftyTwoWeekLow",  "N/A")
                curr  = info.get("currency", "USD")
                name  = info.get("longName", ticker)
            except Exception:
                return ""

        # Fundamentals always from yfinance
        try:
            info = yf.Ticker(ticker).info
            return f"""
LIVE DATA — {ticker.upper()} ({name})
Price         : {curr} {price}
Change        : {chg} ({pct}%)
52W High/Low  : {high} / {low}
Market Cap    : {info.get('marketCap', 'N/A')}
P/E Ratio     : {info.get('trailingPE', 'N/A')}
EPS           : {info.get('trailingEps', 'N/A')}
Revenue       : {info.get('totalRevenue', 'N/A')}
Profit Margin : {info.get('profitMargins', 'N/A')}
Recommendation: {info.get('recommendationKey', 'N/A')}
""".strip()
        except Exception:
            return ""

    def extract_tickers(self, text: str) -> list:
        candidates = re.findall(r'\b[A-Z]{1,5}(?:\.[A-Z]{1,2})?\b', text)
        stopwords  = {"I","A","THE","IS","IN","OR","NOT","AND","FOR","IF",
                      "MY","ME","DO","IT","VS","TO","BE","GO","AI","US",
                      "BY","AT","ON","NO","SO","UP","NOW","GET","PUT"}
        return [c for c in candidates if c not in stopwords]

    def chat(self, message: str, history: list) -> str:
        tickers      = self.extract_tickers(message)
        live_context = ""
        for ticker in tickers[:2]:
            data = self.get_live_data(ticker)
            if data:
                live_context += f"\n\n{data}"

        user_content = message
        if live_context:
            user_content = f"{message}\n\n[LIVE MARKET DATA:{live_context}]"

        messages = [{"role": "system", "content": self.system_prompt}]
        messages += history
        messages.append({"role": "user", "content": user_content})

        response = self.client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            temperature=0.4,
            max_tokens=1000
        )
        return response.choices[0].message.content
