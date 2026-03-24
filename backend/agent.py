import asyncio
import os
import traceback
from dotenv import load_dotenv
load_dotenv()

from browser_use import Agent, Controller, Browser
from llm_config import get_llm

controller = Controller()

async def run_browser_task(task_prompt: str, send_status=None):
    llm_timeout = int(os.getenv("LLM_TIMEOUT", "600"))
    headless_env = os.getenv("BROWSER_HEADLESS", "false").lower() == "true"

    if send_status:
        await send_status("⏳ Initializing Browser Agent...")

    llm = get_llm()
    browser = Browser(headless=headless_env)

    if send_status:
        await send_status(f"🌐 Browser launched (headless={headless_env})")
        await send_status(f"🤖 Model: {os.getenv('OLLAMA_MODEL', 'qwen3.5:9b')} | Timeout: {llm_timeout}s")

    agent = Agent(
        task=task_prompt,
        llm=llm,
        browser=browser,
        controller=controller,
        use_vision=False,
        llm_timeout=llm_timeout,
        max_failures=3,
    )

    try:
        result = await agent.run()
    except Exception as e:
        tb = traceback.format_exc()
        print(f"AGENT ERROR:\n{tb}")
        if send_status:
            await send_status(f"❌ Agent failed: {repr(e)}")
        await browser.close()
        raise
    finally:
        try:
            await browser.close()
        except Exception:
            pass

    if send_status:
        await send_status("✅ Task completed successfully!")

    if hasattr(result, 'final_result'):
        out = result.final_result()
        if out is None:
            return "Agent finished but did not extract a specific text result."
        return out
    return str(result)
