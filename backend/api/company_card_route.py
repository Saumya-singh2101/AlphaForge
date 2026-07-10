from fastapi import APIRouter
import yfinance as yf
from groq import Groq
import os
import json

router = APIRouter(tags=["Company Card"])
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

@router.get("/company-card/{ticker}")
def company_card(ticker: str):
    try:
        stock = yf.Ticker(ticker)
        info  = stock.info

        name    = info.get("longName") or info.get("shortName") or ticker
        website = info.get("website") or ""
        country = info.get("country") or ""
        founded = info.get("founded") or ""
        city    = info.get("city") or ""

        # Extract domain for Clearbit logo
        domain = ""
        if website:
            domain = website.replace("https://", "").replace("http://", "").replace("www.", "").split("/")[0]

        # Use LLM to get leadership info
        prompt = f"""Return ONLY a JSON object for {name} ({ticker}) with these exact keys:
{{
  "ceo": "Full Name or Unknown",
  "cfo": "Full Name or Unknown", 
  "cto": "Full Name or Unknown",
  "founded": "Year or Unknown",
  "headquarters": "City, Country or Unknown",
  "employees": "Number or Unknown"
}}
No explanation. No markdown. Pure JSON only."""

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You return only valid JSON. No markdown, no explanation."},
                {"role": "user",   "content": prompt}
            ],
            temperature=0.1,
            max_tokens=200
        )

        raw = response.choices[0].message.content.strip()
        # Clean any accidental markdown
        raw = raw.replace("```json", "").replace("```", "").strip()
        leadership = json.loads(raw)

    except Exception as e:
        leadership = {
            "ceo": "Unknown", "cfo": "Unknown", "cto": "Unknown",
            "founded": "Unknown", "headquarters": "Unknown", "employees": "Unknown"
        }

    return {
        "ticker":      ticker.upper(),
        "name":        name,
        "domain":      domain,
        "logo_url":    f"https://logo.clearbit.com/{domain}" if domain else "",
        "country":     country,
        "website":     website,
        **leadership
    }
