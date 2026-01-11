# ScreenRack Technical Overview

## 1. Project Description
ScreenRack is a **local-first, AI-powered screenshot search engine**. It allows users to search through their library of screenshot images using natural language (semantic search) or text present inside the image (OCR).

**Key Features:**
- **Privacy Focused**: Runs 100% locally. No images leave your machine.
- **Hybrid Search**: Combines Visual Understanding (CLIP) + Text Recognition (OCR).
- **Cyberpunk UI**: A modern, reactive interface built with React.

---

## 2. Architecture High-Level

The system consists of two main components communicating via HTTP:

```mermaid
graph LR
    User[User] -->|Interacts| Frontend[React Frontend\n(Port 5173)]
    Frontend -->|HTTP Requests| Backend[Flask Backend\n(Port 5000)]
    Backend -->|Reads| FS[File System\n(Screenshots)]
    Backend -->|Read/Write| DB[(ChromaDB\nVector Store)]
    Backend -->|Inference| AI[CLIP Model &\nTesseract OCR]
```

---

## 3. Backend Technical Details
**Location**: `/backend`
**Stack**: Python, Flask, ChromaDB, PyTorch (Sentence-Transformers), Tesseract.

### Key Files & Responsibilities

#### `main.py` (The API Gateway)
- **Role**: The entry point for the Flask application.
- **Routes**:
  - `POST /search`: Receives a query string, delegates to `Searcher`, returns JSON results.
  - `POST /index`: Triggers the `indexer.py` logic to scan for new images.
  - `GET /screenshots/<path>`: Serves the actual image files to the frontend.
- **Setup**: Configures CORS (Cross-Origin Resource Sharing) so the frontend can talk to it.

#### `indexer.py` (The Ingestion Engine)
- **Role**: Scans the `screenshots/` folder and populates the database.
- **Workflow**:
  1. Lists all images in the folder.
  2. Checks ChromaDB to skip already indexed files (Idempotency).
  3. **Pipeline for new images**:
     - **OCR**: Extracts text using `utils.run_ocr`.
     - **Embedding**: Generates a 512-dim vector using `utils.get_clip_embedding`.
     - **Storage**: Saves `{id, embedding, metadata, document_text}` to ChromaDB.

#### `searcher.py` (The Query Engine)
- **Role**: Executes the Hybrid Search logic.
- **Logic**:
  1. **Vector Search**: Converts user query -> Vector (using CLIP text encoder) -> Finds nearest image neighbors in ChromaDB. This captures *concept* (e.g., "login page" matches an image of a login form).
  2. **Keyword Search (Refinement)**: Checks if the user's query exists explicitly in the OCR text of the candidates.
  3. **Ranking**: Results matching *both* visual concept and text keywords get a score boost.

#### `utils.py` (The Toolbox)
- **Role**: Shared helper functions.
- **Key Functions**:
  - `load_image()`: Safely loads images with PIL.
  - `run_ocr()`: Wraps `pytesseract` to return string content.
  - `get_clip_embedding()`: Uses `sentence-transformers/clip-ViT-B-32` to convert images/text to vectors. *Note: The heavy ML model is loaded here as a singleton.*

---

## 4. Frontend Technical Details
**Location**: `/frontend`
**Stack**: React, Vite, Tailwind CSS, Axios.

### Key Files & Responsibilities

#### `src/SearchPage.jsx` (The Main Controller)
- **Role**: Orchestrates the UI state (query, results, loading, error).
- **Logic**:
  - Debounces input (users usually press Enter).
  - Calls `api.search(query)` on submit.
  - Displays `ResultGrid` or `NoResults` based on outcome.

#### `src/api.js` (The Bridge)
- **Role**: Centralized Axios instance.
- **Config**: Points to `http://localhost:5000`.
- **Methods**: `search()`, `reindex()`, `getScreenshotUrl()`. Abstracts away the HTTP details from components.

#### `src/ResultGrid.jsx` & `src/ImageModal.jsx` (The View)
- **Role**: Pure presentation components.
- **Features**: 
  - Masonry-like grid layout.
  - Modal with keyboard support (Esc to close).
  - Displays OCR text if available (for debugging/copying).

---

## 5. Data Flow Example: "Searching for code"

1. **User** types "python function" in Frontend.
2. **Frontend** sends POST to `localhost:5000/search` with body `{"query": "python function"}`.
3. **Backend (`main.py`)** receives request, calls `searcher.search("python function")`.
4. **Searcher**:
   - Computes vector for "python function".
   - Queries ChromaDB for images visually similar to that concept.
   - *Simultaneously* checks if "python" or "function" text appears in those images (OCR match).
5. **ChromaDB** returns top matches (e.g., `screenshot_1.png` which looks like code).
6. **Backend** returns JSON list: `[{path: "...", score: 0.85}, ...]`.
7. **Frontend** renders list. When user clicks, it loads image from `localhost:5000/screenshots/...`.
