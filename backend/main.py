from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api import chart_routes
from api import competitor_routes
from api import report_routes
from api import quotes_routes
from api.rag_routes import router as rag_router
from api.chat_routes import router as chat_router  # ← NEW

# your actual files
from api.company import router as company_router
from api.financial import router as financial_router


app = FastAPI(
    title="AlphaForge AI",
    version="1.0.0"
)

# -------------------------
# CORS
# -------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# ROOT
# -------------------------
@app.get("/")
def home():
    return {
        "message": "Welcome to AlphaForge AI 🚀"
    }

# -------------------------
# ROUTERS
# -------------------------
app.include_router(company_router)
app.include_router(financial_router)

app.include_router(chart_routes.router)
app.include_router(competitor_routes.router)
app.include_router(report_routes.router)
app.include_router(quotes_routes.router)
app.include_router(rag_router)
app.include_router(chat_router)  # ← NEW
