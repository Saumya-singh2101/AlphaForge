from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
import os
import uuid

from rag.pdf_loader import load_pdf_text
from rag.chunker import chunk_text
from rag.vector_db import VectorStore
from rag.qa_engine import QAEngine

router = APIRouter()

vector_db = VectorStore()
qa_engine = QAEngine()


# -------------------------
# Request Schema
# -------------------------
class QueryRequest(BaseModel):
    question: str


# -------------------------
# Upload PDF
# -------------------------
@router.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):

    file_id = str(uuid.uuid4())
    file_path = f"temp_{file_id}.pdf"

    try:
        with open(file_path, "wb") as f:
            f.write(await file.read())

        text = load_pdf_text(file_path)

        if not text or not text.strip():
            raise HTTPException(
                status_code=400,
                detail="PDF contains no readable text"
            )

        chunks = chunk_text(text)

        if not chunks:
            raise HTTPException(
                status_code=500,
                detail="Chunking failed"
            )

        vector_db.add_chunks(chunks, doc_id=file_id)

        return {
            "message": "PDF processed successfully",
            "doc_id": file_id,
            "chunks_stored": len(chunks)
        }

    finally:
        if os.path.exists(file_path):
            os.remove(file_path)


# -------------------------
# Ask RAG Question
# -------------------------
@router.post("/ask")
def ask(request: QueryRequest):                         # ✅ was AskRequest
    query = request.question

    search_results = vector_db.search(query, k=5)      # ✅ was vector_store
    context: list[str] = search_results["documents"]

    if not context:
        return {
            "answer": "I couldn't find relevant information in the uploaded documents.",
            "context_used": [],
            "sources": []
        }

    answer = qa_engine.answer(query, context)

    return {
        "answer": answer,
        "context_used": context[:3],
        "sources": search_results["metadatas"][:3]
    }
