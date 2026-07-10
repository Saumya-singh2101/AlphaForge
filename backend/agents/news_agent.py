import os
import requests
from dotenv import load_dotenv
from groq import Groq

# Force .env values to override old environment variables
load_dotenv(override=True)


class NewsAgent:

    def __init__(self):

        # Read API keys from .env
        self.groq_api_key = os.getenv("GROQ_API_KEY")
        self.news_api_key = os.getenv("NEWS_API_KEY")

        # Debug (remove after testing)
        print("Groq Key Loaded :", self.groq_api_key[:15] + "...")
        print("News Key Loaded :", self.news_api_key[:10] + "...")

        # Initialize Groq client
        self.client = Groq(
            api_key=self.groq_api_key
        )

    def fetch_news(self, query: str):

        url = (
            f"https://newsapi.org/v2/everything?"
            f"q={query}"
            f"&language=en"
            f"&sortBy=publishedAt"
            f"&pageSize=5"
            f"&apiKey={self.news_api_key}"
        )

        response = requests.get(url)

        print("NewsAPI Status:", response.status_code)

        data = response.json()

        # If NewsAPI gives an error, stop immediately
        if data.get("status") != "ok":
            raise Exception(data.get("message"))

        return data.get("articles", [])

    def analyze_with_llm(self, title: str, description: str):

        prompt = f"""
You are an expert financial news analyst.

Analyze the following news.

Return ONLY this format:

Sentiment: Positive / Neutral / Negative
Summary: Maximum 2 concise sentences.
Impact: Low / Medium / High

News Title:
{title}

News Description:
{description}
"""

        response = self.client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        return response.choices[0].message.content

    def run(self, query: str):

        articles = self.fetch_news(query)

        results = []

        seen_titles = set()

        for article in articles:

            title = article.get("title")

            # Skip duplicates
            if title in seen_titles:
                continue

            seen_titles.add(title)

            description = article.get("description") or ""

            analysis = self.analyze_with_llm(
                title,
                description
            )

            results.append({
                "title": title,
                "analysis": analysis,
                "url": article.get("url"),
                "published_at": article.get("publishedAt"),
                "source": article.get("source", {}).get("name")
            })

        return results