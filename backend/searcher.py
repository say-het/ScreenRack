import chromadb
import utils
import os
import logging

# Configure Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Configuration (same as indexer)
DB_DIR = os.path.join(os.path.dirname(__file__), "db", "chroma")
COLLECTION_NAME = "screenrack"

class Searcher:
    def __init__(self):
        logger.info("Loading ChromaDB...")
        try:
            self.client = chromadb.PersistentClient(path=DB_DIR)
            self.collection = self.client.get_or_create_collection(name=COLLECTION_NAME)
            logger.info("Searcher ready.")
        except Exception as e:
            logger.error(f"Failed to initialize Searcher: {e}")
            raise

    def search(self, query: str, top_k: int = 5) -> list:
        """
        Search for screenshots matching the query using hybrid search.
        1. CLIP Vector Search (Semantic)
        2. Keyword matching in OCR text (Exact)
        Merges and ranks results.
        """
        results_map = {} # Map doc_id -> {path, text, vector_score, keyword_score}

        # 1. Vector Search
        # Fetch more candidates to ensure good semantic overlap
        try:
            query_embedding = utils.get_text_embedding(query)
            if query_embedding:
                vector_results = self.collection.query(
                    query_embeddings=[query_embedding],
                    n_results=20 # Fetch top 20 for re-ranking
                )
                
                if vector_results['ids']:
                    for i, doc_id in enumerate(vector_results['ids'][0]):
                        distance = vector_results['distances'][0][i]
                        metadata = vector_results['metadatas'][0][i]
                        document = vector_results['documents'][0][i]
                        
                        # Normalize distance to score (0-1 range approx)
                        # Assuming L2 distance, lower is better. 1/(1+d)
                        v_score = 1.0 / (1.0 + distance)
                        
                        results_map[doc_id] = {
                            "path": metadata["path"],
                            "text": document,
                            "score": v_score,
                            "matches_keyword": False
                        }
        except Exception as e:
            logger.error(f"Vector search failed: {e}")

        # 2. Keyword Search (Content Filter)
        # ChromaDB supports basic string containment in documents using `where_document`
        # Note: This is case-sensitive in standard Chroma implementations usually.
        # We try to match exact case or rely on the fact that OCR is unpredictable.
        try:
            keyword_results = self.collection.get(
                where_document={"$contains": query}
            )
            
            if keyword_results['ids']:
                for i, doc_id in enumerate(keyword_results['ids']):
                    metadata = keyword_results['metadatas'][i]
                    document = keyword_results['documents'][i]
                    
                    if doc_id in results_map:
                        results_map[doc_id]["matches_keyword"] = True
                    else:
                        # Found via keyword but not in top vector results
                        # Assign a base score. Vector score is missing, so we give it a boost.
                        results_map[doc_id] = {
                            "path": metadata["path"],
                            "text": document,
                            "score": 0.5, # Base score for keyword-only match
                            "matches_keyword": True
                        }
        except Exception as e:
            logger.error(f"Keyword search failed or not supported: {e}")
            
        # 3. Local In-Memory Refinement (Case-Insensitive Check)
        # Iterate over all gathered results to verify/boost case-insensitive matches
        final_results = []
        for doc_id, data in results_map.items():
            score = data["score"]
            
            # Additional case-insensitive check
            if query.lower() in data["text"].lower():
                data["matches_keyword"] = True
                
            if data["matches_keyword"]:
                score *= 1.5 # Significant boost for keyword match
                
            # Cap score
            score = min(score, 2.0)
            
            final_results.append({
                "path": data["path"],
                "text": data["text"],
                "score": score
            })

        # Sort by score descending
        final_results.sort(key=lambda x: x["score"], reverse=True)
        
        return final_results[:top_k]

if __name__ == "__main__":
    s = Searcher()
    while True:
        try:
            q = input("Query (or 'exit'): ")
            if q == 'exit': break
            res = s.search(q)
            for r in res:
                print(f"{r['score']:.4f}: {r['path']}")
        except KeyboardInterrupt:
            break
