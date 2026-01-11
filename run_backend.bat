@echo off
echo Starting ScreenRack Backend...
cd backend
call venv\Scripts\activate
python main.py
pause
