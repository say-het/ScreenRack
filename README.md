# ScreenRack

A local-only screenshot search engine.

## Description
ScreenRack indexes your screenshots and allows you to search them using natural language. It uses a Python backend for indexing (with ChromaDB) and a React frontend for the search interface.

## Project Structure
- `backend/`: Python backend (FastAPI, ChromaDB)
  - `db/chroma/`: Vector database storage
  - `screenshots/`: Storage for screenshots
- `frontend/`: React + Vite + Tailwind frontend

## Quick Start

1. **Backend**: Double-click `run_backend.bat`
   - Runs on `http://localhost:5000`
   - Ensures virtual environment is active
2. **Frontend**: Double-click `run_frontend.bat`
   - Runs on `http://localhost:5173`

## Manual Setup

### Backend
1. Navigate to `backend/`:
   ```bash
   cd backend
   ```
2. Create/Activate virtual environment:
   ```bash
   python -m venv venv
   .\venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Install Tesseract OCR (see below)
5. Run the server:
   ```bash
   python main.py
   ```

### Frontend
1. Navigate to `frontend/`:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

### Tesseract OCR Requirement
1. Download from [UB-Mannheim/tesseract](https://github.com/UB-Mannheim/tesseract/wiki).
2. Install to default location or add to System PATH. 
3. If installed elsewhere, update `utils.py` with `pytesseract.pytesseract.tesseract_cmd`.