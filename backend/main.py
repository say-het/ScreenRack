from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import os
import indexer
from searcher import Searcher
import logging

# Configure Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
# Enable CORS for Vite frontend
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

# Helpers
SCREENSHOTS_DIR = os.path.join(os.path.dirname(__file__), "screenshots")

# Initialize Searcher (loads ChromaDB)
# Note: CLIP model is loaded in utils.py which is imported by indexer/searcher
logger.info("Initializing Searcher...")
try:
    searcher = Searcher()
except Exception as e:
    logger.critical(f"Failed to initialize searcher: {e}")
    searcher = None

@app.route('/health')
def health():
    return jsonify({"status": "ok"})

@app.route('/index', methods=['POST'])
def run_indexer():
    logger.info("Received index request")
    try:
        count = indexer.run_indexing()
        return jsonify({"count": count, "message": f"Indexed {count} new images."})
    except Exception as e:
        logger.error(f"Indexing error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/search', methods=['POST'])
def search_images():
    data = request.json
    query = data.get('query', '')
    logger.info(f"Received search request: {query}")
    if not query:
        return jsonify({"results": []})
    
    if searcher is None:
         logger.error("Searcher is not initialized.")
         return jsonify({"error": "Searcher not available"}), 500

    try:
        results = searcher.search(query)
        logger.info(f"Found {len(results)} results")
        # Transform results if needed, but searcher returns list of dicts which is JSON serializable
        return jsonify({"results": results})
    except Exception as e:
        logger.error(f"Search error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/screenshots/<path:filename>')
def serve_screenshot(filename):
    return send_from_directory(SCREENSHOTS_DIR, filename)

if __name__ == '__main__':
    # Ensure screenshots dir exists
    os.makedirs(SCREENSHOTS_DIR, exist_ok=True)
    app.run(debug=True, port=5000)
