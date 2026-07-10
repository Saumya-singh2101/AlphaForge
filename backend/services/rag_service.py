from rag.pdf_loader import load_pdf_text
from rag.chunk import chunk_text
from rag.vector_db import VectorStore

class RAGService:

    def __init__(self):
        self.vs = VectorStore()

    def ingest_pdf(self, file_path: str, doc_id: str):
        text = load_pdf_text(file_path)
        chunks = chunk_text(text)
        self.vs.add_chunks(chunks, doc_id)
        return len(chunks)

    def ask(self, query: str):
        relevant_docs = self.vs.search(query)

        context = "\n".join(relevant_docs)

        return context