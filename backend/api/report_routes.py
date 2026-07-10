from fastapi import APIRouter, HTTPException
from services.llm_service import llm
from graph.report_graph import build_report_graph

router = APIRouter(
    prefix="/report",
    tags=["AI Report"]
)

# Build the LangGraph pipeline once at startup
report_graph = build_report_graph(llm)


@router.get("/{ticker}")
def get_report(ticker: str):
    try:
        initial_state = {
            "ticker": ticker.upper(),
            "research_output": None,
            "financial_output": None,
            "news_output": None,
            "risk_output": None,
            "competitor_output": None,
            "final_report": None,
        }

        # Run the full multi-agent pipeline
        final_state = report_graph.invoke(initial_state)

        return {
            "ticker": ticker.upper(),
            "report": final_state["final_report"],
            "raw_data": {
                "research":    final_state.get("research_output"),
                "financial":   final_state.get("financial_output"),
                "news":        final_state.get("news_output"),
                "risk":        final_state.get("risk_output"),
                "competitors": final_state.get("competitor_output"),
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
