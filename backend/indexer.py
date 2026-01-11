import os
import chromadb
from chromadb.config import Settings
import utils
import logging

# Configure Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Configuration
SCREENSHOTS_DIR = os.path.join(os.path.dirname(__file__), "screenshots")
DB_DIR = os.path.join(os.path.dirname(__file__), "db", "chroma")
COLLECTION_NAME = "screenrack"

def run_indexing():
    logger.info("Initializing ChromaDB client...")
    client = chromadb.PersistentClient(path=DB_DIR)
    
    collection = client.get_or_create_collection(name=COLLECTION_NAME)
    
    existing_ids = set(collection.get()["ids"])
    logger.info(f"Found {len(existing_ids)} existing items in index.")

    if not os.path.exists(SCREENSHOTS_DIR):
        logger.warning(f"Screenshots directory not found: {SCREENSHOTS_DIR}")
        return 0

    files = [f for f in os.listdir(SCREENSHOTS_DIR) if f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp'))] # Filter for images
    logger.info(f"Found {len(files)} images in {SCREENSHOTS_DIR}")

    new_count = 0
    for filename in files:
        file_path = os.path.join(SCREENSHOTS_DIR, filename)
        
        # Use filename as ID or a hash
        doc_id = filename
        
        if doc_id in existing_ids:
            # Skip if already indexed
            continue
            
        logger.info(f"Processing: {filename}...")
        try:
            image = utils.load_image(file_path)
            
            # Run OCR
            ocr_text = utils.run_ocr(image)
            
            # Generate Embedding
            embedding = utils.get_clip_embedding(image)
            
            if not embedding:
                logger.warning(f"Skipping {filename}: Failed to generate embedding.")
                continue

            # Add to Chroma
            collection.add(
                documents=[ocr_text],
                embeddings=[embedding],
                metadatas=[{"filename": filename, "path": file_path}],
                ids=[doc_id]
            )
            logger.info(f"Indexed: {filename}")
            new_count += 1
            
        except Exception as e:
            logger.error(f"Error processing {filename}: {e}")

    logger.info(f"Indexing complete. Added {new_count} new images.")
    return new_count

if __name__ == "__main__":
    run_indexing()
