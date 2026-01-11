import requests
import os
import sys

BASE_URL = "http://localhost:5000"

def log(msg, type="INFO"):
    print(f"[{type}] {msg}")

def test_health():
    log("Testing GET /health...")
    try:
        res = requests.get(f"{BASE_URL}/health")
        if res.status_code == 200 and res.json().get("status") == "ok":
            log("Health check passed.", "SUCCESS")
            return True
        else:
            log(f"Health check failed: {res.text}", "ERROR")
            return False
    except Exception as e:
        log(f"Health check exception: {e}", "ERROR")
        return False

def test_index():
    log("Testing POST /index...")
    try:
        res = requests.post(f"{BASE_URL}/index")
        if res.status_code == 200:
            data = res.json()
            log(f"Indexing successful. Count: {data.get('count')}", "SUCCESS")
            return True
        else:
            log(f"Indexing failed: {res.text}", "ERROR")
            return False
    except Exception as e:
        log(f"Indexing exception: {e}", "ERROR")
        return False

def test_search(query):
    log(f"Testing POST /search with query: '{query}'...")
    try:
        res = requests.post(f"{BASE_URL}/search", json={"query": query})
        if res.status_code == 200:
            results = res.json().get("results", [])
            log(f"Search returned {len(results)} results.", "SUCCESS")
            for r in results:
                print(f"   - {r['score']:.2f} | {r['path']}")
            return True
        else:
            log(f"Search failed: {res.text}", "ERROR")
            return False
    except Exception as e:
        log(f"Search exception: {e}", "ERROR")
        return False

if __name__ == "__main__":
    log("Starting System Validation...")
    
    # 1. Health
    if not test_health():
        log("Backend seems down. Please run 'run_backend.bat'", "FATAL")
        sys.exit(1)

    # 2. Index
    test_index()

    # 3. Search (CLIP Semantic)
    test_search("code")

    # 4. Search (OCR Keyword)
    # We assume 'import' is likely in code screenshots
    test_search("import")
    
    log("Validation Complete.", "INFO")
