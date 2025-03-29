@echo off
start cmd /k "cd backend && python -m uvicorn main:app --reload"
start cmd /k "npm run dev" 