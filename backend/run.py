import sys
import asyncio

if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

import httpx

def check_ollama():
    try:
        resp = httpx.get("http://localhost:11434/api/tags", timeout=5)
        if resp.status_code == 200:
            models = [m["name"] for m in resp.json().get("models", [])]
            print(f"✅ Ollama is running. Available models: {models}")
            return True
    except Exception:
        pass
    print("⚠️  WARNING: Ollama is not reachable at http://localhost:11434")
    print("   Start it with: ollama serve")
    return False

if __name__ == "__main__":
    check_ollama()
    import uvicorn
    reload_flag = "--reload" in sys.argv
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=reload_flag, loop="asyncio")
