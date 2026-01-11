import chromadb
import os

DB_DIR = os.path.join("backend", "db", "chroma")
COLLECTION_NAME = "screenrack"

try:
    client = chromadb.PersistentClient(path=DB_DIR)
    collection = client.get_or_create_collection(name=COLLECTION_NAME)
    count = collection.count()
    print(f"Total indexed documents: {count}")
except Exception as e:
    print(f"Error checking DB: {e}")
