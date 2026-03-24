# Browser Automation AI Agent (IDX Ready)

This is a Full-stack Browser Automation application using React (Vite) and FastAPI, powered by the Browser Use package and Playwright.

## Required Setup: Ollama with DeepSeek R1
Since this agent requires an LLM to navigate the browser, you need Ollama running locally.

1. Install [Ollama](https://ollama.ai)
2. Open a terminal and start the server:
   ```bash
   ollama serve
   ```
3. Pull the DeepSeek R1 model:
   ```bash
   ollama pull deepseek-r1:7b
   ```

## Running the Full Project
If you are inside Google Project IDX, the setup is **automatic**. 
IDX will automatically:
- Create the python virtual environment
- Install python dependencies and Playwright browsers on startup
- Install frontend tracking dependencies on startup
- Spawns two Preview panels for `frontend` and `backend`.

**Manual Run Instructions:**
**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or .\venv\Scripts\activate on Windows
pip install -r requirements.txt
playwright install chromium
uvicorn main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Running Tests
This project includes complete test suites for both backend (`pytest`) and frontend (`vitest`).

**Backend Tests:**
```bash
cd backend
source venv/bin/activate
pytest tests/ -v
```

**Frontend Tests:**
```bash
cd frontend
npm run test
```
