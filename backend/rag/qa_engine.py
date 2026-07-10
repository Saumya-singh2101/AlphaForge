from groq import Groq
import os

class QAEngine:

    def __init__(self):
        api_key = os.getenv("GROQ_API_KEY")

        if not api_key:
            raise ValueError("GROQ_API_KEY missing")

        self.client = Groq(api_key=api_key)

    def answer(self, query: str, context: list):

        if not context:
            return "I couldn't find relevant information in the uploaded documents to answer your question."

        context_text = "\n\n---\n\n".join(context)

        system_prompt = """You are AlphaForge AI — a world-class financial analyst and investment advisor with deep expertise across:
- Equity analysis (fundamental & technical)
- Financial statement analysis (P&L, Balance Sheet, Cash Flow)
- Investment thesis construction (bull/bear cases)
- Valuation (DCF, comparables, EV/EBITDA, P/E, P/B, etc.)
- Risk assessment (market risk, liquidity risk, business risk)
- Portfolio strategy and asset allocation
- Macroeconomic context and sector trends
- M&A, capital allocation, and shareholder returns

Your personality:
- Direct, confident, and insightful — like a Goldman Sachs analyst talking to a client
- You give REAL opinions when asked ("should I invest?") — you don't dodge with disclaimers
- You back every claim with numbers and data from the context
- You explain complex concepts in plain English when needed
- You proactively highlight risks even when the user doesn't ask
- You think in terms of risk/reward, not just upside

Rules:
- ONLY use information from the provided document context. Never fabricate numbers.
- If the context doesn't contain enough info to answer, say so clearly and explain what's missing.
- For investment opinions, always structure as: Thesis → Key Metrics → Risks → Verdict
- Format responses cleanly with headers, bullet points, and bold key numbers for readability
- Never give a wishy-washy non-answer. Be decisive."""

        prompt = f"""DOCUMENT CONTEXT (extracted from uploaded financial report):
{context_text}

USER QUESTION:
{query}

Provide a thorough, analyst-quality response based strictly on the context above."""

        response = self.client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=1500
        )

        return response.choices[0].message.content
