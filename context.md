# Project Context — Browser Automation AI Agent

## Overview
A full-stack browser automation application that uses a local LLM (via Ollama) to autonomously control a web browser through natural language instructions. The user types a task in a React frontend, and the backend dispatches a Playwright-driven browser agent powered by the `browser-use` library.

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Frontend | React + TypeScript (Vite) | React 19, Vite 8 |
| Backend | FastAPI (Python) | FastAPI 0.135, Python 3.14 |
| Browser Automation | browser-use + Playwright | browser-use 0.12.2, Playwright 1.58 |
| LLM | Ollama (local) | qwen3.5:9b |
| LLM Integration | browser-use ChatOllama wrapper | langchain-ollama 1.0.1 |
| Testing | pytest (backend), vitest + React Testing Library (frontend) | — |

---

## Project Structure

```
projectllm/
├── .idx/
│   └── dev.nix                  # Google Project IDX workspace config
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── PromptInput.tsx       # Text area + submit button
│   │   │   ├── PromptInput.test.tsx  # Vitest: render, state, submit
│   │   │   ├── TaskStatus.tsx        # Live step-by-step agent status
│   │   │   ├── TaskStatus.test.tsx   # Vitest: messages, empty state
│   │   │   ├── ResultViewer.tsx      # Final result display
│   │   │   └── ResultViewer.test.tsx # Vitest: null guard, render
│   │   ├── App.tsx                   # Main app with WebSocket + fetch
│   │   ├── App.css
│   │   ├── main.tsx
│   │   └── setupTests.ts            # @testing-library/jest-dom import
│   ├── vite.config.ts               # Vitest config (jsdom environment)
│   ├── package.json
│   └── tsconfig.json
├── backend/
│   ├── main.py              # FastAPI: CORS, /run-task, /ws endpoints
│   ├── agent.py              # browser-use Agent orchestration
│   ├── llm_config.py         # ChatOllama config (qwen3.5:9b)
│   ├── run.py                # Windows-safe launcher (ProactorEventLoop)
│   ├── requirements.txt
│   ├── .env                  # OLLAMA_BASE_URL, BROWSER_HEADLESS
│   └── tests/
│       ├── test_api.py           # FastAPI endpoint + CORS + WS tests
│       ├── test_agent.py         # Agent initialization test
│       └── test_llm_connection.py # Ollama reachability + model test
└── README.md
```

---

## Architecture & Data Flow

```
┌──────────────┐    POST /run-task     ┌──────────────────┐
│   React UI   │ ────────────────────► │  FastAPI Backend  │
│  (port 5173) │                       │   (port 8000)     │
│              │ ◄──── WebSocket ───── │                   │
│  PromptInput │   status/result msgs  │  main.py          │
│  TaskStatus  │                       │    ↓              │
│  ResultViewer│                       │  agent.py         │
└──────────────┘                       │    ↓              │
                                       │  browser-use Agent│
                                       │    ↓              │
                                       │  Playwright       │
                                       │  (Chromium)       │
                                       │    ↓              │
                                       │  ChatOllama ──────┼──► Ollama API
                                       │  (qwen3.5:9b)     │    localhost:11434
                                       └──────────────────┘
```

1. User types a prompt in `PromptInput.tsx` and clicks "Start Task"
2. Frontend sends `POST /run-task` with `{ prompt: "..." }` to FastAPI
3. FastAPI spawns an `asyncio.create_task()` that runs `run_browser_task()`
4. `agent.py` initializes a `browser-use` Agent with Playwright + ChatOllama
5. The Agent opens a headed Chromium window and begins browsing autonomously
6. Real-time status updates are streamed to the frontend via WebSocket (`/ws`)
7. Final result is sent as `{ type: "result", message: "..." }` over WebSocket
8. `ResultViewer.tsx` renders the final output

---

## Key Files Explained

### `backend/run.py` (Entry Point)
Sets `WindowsProactorEventLoopPolicy` **before** importing uvicorn. This is critical on Windows because:
- Uvicorn defaults to `SelectorEventLoop` which **cannot** create subprocesses
- `browser-use` launches Chromium via `asyncio.create_subprocess_exec()`
- Without ProactorEventLoop, this throws `NotImplementedError` instantly

**Always start the backend with:** `python run.py` (NOT `uvicorn main:app`)

### `backend/agent.py`
- Uses `browser-use`'s internal `ChatOllama` wrapper (NOT `langchain-ollama` directly)
- `use_vision=False` — disables screenshot-based reasoning to reduce inference time
- `llm_timeout=600` — gives the local model 10 minutes per step (configurable via `.env`)
- `max_failures=3` — allows 3 retries before giving up
- `num_ctx=8192` in `llm_config.py` — context window size for inference

### `backend/main.py`
- Clean FastAPI app with no event loop hacks
- CORS allows all origins (dev mode)
- WebSocket endpoint `/ws` for real-time status streaming
- `POST /run-task` spawns a background `asyncio.create_task()`

### `backend/llm_config.py`
- Uses `browser_use.ChatOllama` (NOT `langchain_ollama.ChatOllama`)
- `browser-use` requires its own wrapper to inject `.provider` metadata
- Model: `qwen3.5:9b` (text model, used with `use_vision=False` for browser tasks)

---

## Bugs Fixed During Development

| # | Bug | Root Cause | Fix |
|---|---|---|---|
| 1 | `ModuleNotFoundError: browser_use.browser.browser` | browser-use 0.12.x refactored; `BrowserConfig` removed | Import `Browser` from `browser_use` directly |
| 2 | `ChatOllama has no attribute 'provider'` | `langchain_ollama.ChatOllama` lacks `.provider` | Use `browser_use.ChatOllama` wrapper instead |
| 3 | `ChatOllama.__init__() got unexpected keyword argument 'base_url'` | browser-use's ChatOllama doesn't accept `base_url` | Removed `base_url` parameter |
| 4 | `NotImplementedError` in `_make_subprocess_transport` | Windows SelectorEventLoop can't spawn subprocesses | Created `run.py` with `WindowsProactorEventLoopPolicy` |
| 5 | Server crash after task completes | Threading approach set global event loop policy, corrupting Uvicorn's loop | Removed threading; use `run.py` launcher instead |
| 6 | `LLM call timed out after 75 seconds` | Local 7B model too slow for default timeout | Set `llm_timeout=300`, `num_ctx=4096`, `use_vision=False` |

---

## Environment Variables (`backend/.env`)

```env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen3.5:9b
BROWSER_HEADLESS=false
LLM_TIMEOUT=600
```

---

## How to Run

### Prerequisites
- Python 3.11+ installed
- Node.js 18+ installed
- Ollama installed and running with a model pulled

### Start Ollama
```bash
ollama serve
ollama pull qwen3.5:9b
```

### Start Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
playwright install chromium
python run.py                  # MUST use run.py, not uvicorn directly
```

### Start Frontend
```bash
cd frontend
npm install
npm run dev
```

### Run Tests
```bash
# Backend
cd backend && pytest tests/ -v

# Frontend
cd frontend && npm run test
```

---

## Current Status
- **Frontend:** ✅ Fully functional (all 8 vitest tests pass)
- **Backend API:** ✅ Fully functional (5 pytest tests pass — CORS, REST, WebSocket, Ollama connectivity)
- **Browser Launch:** ✅ Chromium opens in headed mode successfully
- **LLM Integration:** ⚠️ Local qwen3.5:9b model is slow (~60-120s per step) but functional
- **E2E Automation:** ⚠️ Dependent on local model speed and JSON output quality

---

## Known Limitations
1. Local 9B models are slow for browser automation (60-120s per browser step)
2. Some local models fail to produce strict JSON output required by `browser-use`
3. `browser-use` is optimized for cloud APIs (GPT-4o, Claude 3.5 Sonnet)
4. Windows requires `run.py` launcher; `uvicorn` CLI alone will crash
