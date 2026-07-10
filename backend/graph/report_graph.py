from langgraph.graph import StateGraph, END

from graph.state import ReportState
from agents.research_agent import ResearchAgent
from agents.financial_agent import FinancialAgent
from agents.news_agent import NewsAgent
from agents.risk_agent import RiskAgent
from agents.competitor_agent import CompetitorAgent
from agents.writer_agent import WriterAgent


def build_report_graph(llm):
    """
    Builds and compiles the LangGraph multi-agent pipeline.

    Flow:
        research → financial → news → risk → competitor → writer → END
    """

    # Instantiate all agents
    research_agent   = ResearchAgent()
    financial_agent  = FinancialAgent()
    news_agent       = NewsAgent()
    risk_agent       = RiskAgent(llm)
    competitor_agent = CompetitorAgent()
    writer_agent     = WriterAgent(llm)

    # Wrap existing agents to match LangGraph node signature (state → state)
    def research_node(state: ReportState) -> ReportState:
        return research_agent.run(state)

    def financial_node(state: ReportState) -> ReportState:
        result = financial_agent.run(state["ticker"])      # returns FinancialAnalysisResponse
        return {**state, "financial_output": result}

    def news_node(state: ReportState) -> ReportState:
        result = news_agent.run(state["ticker"])           # returns list of articles
        return {**state, "news_output": result}

    def risk_node(state: ReportState) -> ReportState:
        return risk_agent.run(state)

    def competitor_node(state: ReportState) -> ReportState:
        result = competitor_agent.compare(state["ticker"]) # returns dict
        return {**state, "competitor_output": result}

    def writer_node(state: ReportState) -> ReportState:
        return writer_agent.run(state)

    # Build the graph
    graph = StateGraph(ReportState)

    # Add all nodes
    graph.add_node("research",   research_node)
    graph.add_node("financial",  financial_node)
    graph.add_node("news",       news_node)
    graph.add_node("risk",       risk_node)
    graph.add_node("competitor", competitor_node)
    graph.add_node("writer",     writer_node)

    # Define the pipeline edges (sequential)
    graph.set_entry_point("research")
    graph.add_edge("research",   "financial")
    graph.add_edge("financial",  "news")
    graph.add_edge("news",       "risk")
    graph.add_edge("risk",       "competitor")
    graph.add_edge("competitor", "writer")
    graph.add_edge("writer",     END)

    return graph.compile()
