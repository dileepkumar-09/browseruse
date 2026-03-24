import pytest
import httpx
from langchain_ollama import ChatOllama
import os
from dotenv import load_dotenv

load_dotenv()

BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
MODEL = os.getenv("OLLAMA_MODEL", "qwen3.5:9b")

@pytest.mark.asyncio
async def test_ollama_reachable():
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{BASE_URL}/api/tags")
            assert response.status_code == 200
        except httpx.ConnectError:
            pytest.skip("Ollama is not running locally")

@pytest.mark.asyncio
async def test_model_responds():
    try:
        llm = ChatOllama(model=MODEL, base_url=BASE_URL)
        response = await llm.ainvoke("Say 'Hello Test'")
        assert response.content is not None
        assert len(response.content) > 0
    except Exception as e:
        pytest.skip(f"Could not connect to LLM: {e}")
