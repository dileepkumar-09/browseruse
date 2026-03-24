import os
from dotenv import load_dotenv
from browser_use import ChatOllama

load_dotenv()

def get_llm():
    model = os.getenv("OLLAMA_MODEL", "qwen3.5:9b")
    return ChatOllama(
        model=model,
        ollama_options={
            "temperature": 0,
            "num_ctx": 8192,
            "num_predict": 512,
            "repeat_penalty": 1.1,
        },
    )
