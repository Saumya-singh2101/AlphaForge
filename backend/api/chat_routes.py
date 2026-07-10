from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from agents.chat_agent import ChatAgent
import uuid

router = APIRouter(
    prefix="/chat",
    tags=["AI Chat"]
)

chat_agent = ChatAgent()

# In-memory session store
# session_id → list of {"role": ..., "content": ...}
sessions: dict = {}


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None   # pass this back each time to keep memory


class ChatResponse(BaseModel):
    reply: str
    session_id: str


@router.post("")
def chat(request: ChatRequest):

    # Create new session if none provided
    session_id = request.session_id or str(uuid.uuid4())

    # Get or create history for this session
    if session_id not in sessions:
        sessions[session_id] = []

    history = sessions[session_id]

    # Get reply from agent
    reply = chat_agent.chat(request.message, history)

    # Update history
    history.append({"role": "user",      "content": request.message})
    history.append({"role": "assistant", "content": reply})

    # Keep last 20 messages to avoid token overflow (10 exchanges)
    if len(history) > 20:
        sessions[session_id] = history[-20:]

    return ChatResponse(reply=reply, session_id=session_id)


@router.delete("/{session_id}")
def clear_chat(session_id: str):
    """Clear chat history for a session."""
    if session_id in sessions:
        del sessions[session_id]
    return {"message": "Session cleared"}
