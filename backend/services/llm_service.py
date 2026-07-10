# services/llm_service.py

import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq

load_dotenv()

llm = ChatGroq(
    api_key=os.getenv("GROQ_API_KEY"),  # ✅ FIXED
    model="llama-3.3-70b-versatile"
)