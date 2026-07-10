import chromadb
from sentence_transformers import SentenceTransformer


class VectorStore:

    def __init__(self):
        self.model = SentenceTransformer("all-MiniLM-L6-v2")

        self.client = chromadb.PersistentClient(
            path="./chroma_db"
        )

        self.collection = self.client.get_or_create_collection(
            name="annual_reports"
        )

    def add_chunks(self, chunks, doc_id: str):

        embeddings = self.model.encode(chunks).tolist()

        for i, chunk in enumerate(chunks):
            self.collection.add(
                documents=[chunk],
                embeddings=[embeddings[i]],
                ids=[f"{doc_id}_{i}"],
                metadatas=[{
                    "doc_id": doc_id,
                    "chunk_index": i
                }]
            )

    def search(self, query: str, k: int = 5):
        """
        Returns a flat dict:
            documents : list[str]   — the matched text chunks
            metadatas : list[dict]  — per-chunk metadata
            distances : list[float] — similarity distances
        """
        query_embedding = self.model.encode([query]).tolist()[0]

        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=k
        )

        # ChromaDB wraps everything in an extra list — unwrap it
        documents = results["documents"][0] if results.get("documents") else []
        metadatas = results["metadatas"][0] if results.get("metadatas") else []
        distances = results["distances"][0] if results.get("distances") else []

        return {
            "documents": documents,   # list[str]  ← pass this to QAEngine
            "metadatas": metadatas,   # list[dict]
            "distances": distances    # list[float]
        }
